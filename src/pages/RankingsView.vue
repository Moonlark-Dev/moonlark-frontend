<script setup lang="ts">
import { getRankingByURI, getRankings, type Ranking, type Rankings } from "@/utils/ranking";
import { onMounted, ref } from "vue";
import { showToast } from "@/components/ToastComponent.vue";

const rankingData = ref<Record<string, Ranking>>({});
// initialLoading：尚无数据时的整页加载态；refreshing：手动刷新时保留旧数据的轻量提示
const initialLoading = ref(true);
const refreshing = ref(false);
const error = ref(false);
const updatedAt = ref(0);
let loadedOnce = false;

async function loadRankings(force = false) {
    if (!loadedOnce) initialLoading.value = true;
    else refreshing.value = true;
    error.value = false;
    try {
        const rankings: Rankings = await getRankings({ force });
        const entries = Object.entries(rankings);
        if (entries.length === 0) {
            rankingData.value = {};
            return;
        }
        const race = entries.map(async ([, info]) => [info.name, await getRankingByURI(info.uri, { force })] as [string, Ranking]);
        const merged: Record<string, Ranking> = {};
        let failedCount = 0;
        for (const item of await Promise.allSettled(race)) {
            if (item.status === "fulfilled") merged[item.value[0]] = item.value[1];
            else failedCount += 1;
        }
        rankingData.value = merged;
        updatedAt.value = Date.now();
        if (failedCount > 0) showToast(`部分排行加载失败 (${failedCount})`, "error");
    } catch {
        // 已有旧数据时保留展示，仅提示；首次加载失败才进入整页错误态
        error.value = !loadedOnce;
        showToast("排行数据加载失败", "error");
    } finally {
        initialLoading.value = false;
        refreshing.value = false;
        loadedOnce = true;
    }
}

onMounted(() => {
    loadRankings();
});

function showDate(time: number) {
    const date = new Date(time * 1000);
    return ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
}

function showClock(timeMs: number) {
    return showDate(Math.floor(timeMs / 1000));
}
</script>

<template>
    <div class="page-header">
        <h1>排行</h1>
        <div class="header-actions">
            <span v-if="updatedAt" class="updated-at">更新于 {{ showClock(updatedAt) }}</span>
            <mdui-button-icon
                icon="refresh"
                :disabled="initialLoading || refreshing"
                :class="{ spinning: refreshing }"
                aria-label="刷新排行数据"
                title="强制刷新（忽略缓存）"
                @click="loadRankings(true)"
            ></mdui-button-icon>
        </div>
    </div>

    <!-- 手动刷新时保留旧数据，仅显示顶部进度条 -->
    <mdui-linear-progress v-if="refreshing" class="refresh-bar" indeterminate></mdui-linear-progress>

    <!-- Loading -->
    <div v-if="initialLoading" class="state-box">
        <mdui-linear-progress indeterminate></mdui-linear-progress>
        <p>正在加载排行数据...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="state-box">
        <mdui-icon name="error_outline" style="font-size: 48px; color: #f44336;"></mdui-icon>
        <p>排行数据加载失败，请稍后重试</p>
        <mdui-button @click="loadRankings(true)">重新加载</mdui-button>
    </div>

    <!-- Empty -->
    <div v-else-if="Object.keys(rankingData).length === 0" class="state-box">
        <mdui-icon name="search_off" style="font-size: 48px;"></mdui-icon>
        <p>暂无排行数据</p>
    </div>

    <!-- Rankings -->
    <mdui-list v-else>
        <mdui-collapse accordion>
            <mdui-collapse-item v-for="[rankingName, ranking] of Object.entries(rankingData)" :key="rankingName">
                <mdui-list-item slot="header" icon="leaderboard">
                    <h3>{{ ranking.title || rankingName }} ({{ ranking.total }}) - {{ showDate(ranking.time) }}</h3>
                </mdui-list-item>

                <!-- My rank -->
                <mdui-list-item v-if="ranking.me" class="me-row">
                    🏅 {{ ranking.me.index }}. {{ ranking.me.nickname }} - {{ ranking.me.data }}
                    <small v-if="ranking.me.info"> ({{ ranking.me.info }})</small>
                </mdui-list-item>
                <mdui-divider v-if="ranking.me" inset></mdui-divider>

                <mdui-list-item v-for="user of ranking.users"
                    :key="user.user_id + user.index">
                    {{ user.index }}. {{ user.nickname }}
                    <small v-if="user.info"> ({{ user.info }})</small>
                    - {{ user.data }}
                </mdui-list-item>
                <mdui-divider inset></mdui-divider>
            </mdui-collapse-item>
        </mdui-collapse>
    </mdui-list>
</template>

<style scoped lang="scss">
.page-header {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;

    h1 {
        margin: 0;
    }
}

.header-actions {
    display: flex;
    gap: 4px;
    align-items: center;
}

.updated-at {
    font-size: 0.85em;
    color: var(--mdui-color-on-surface-variant);
}

.refresh-bar {
    width: 100%;
    margin-bottom: 8px;
}

.spinning {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.state-box {
    text-align: center;
    padding: 40px 20px;
    color: var(--mdui-color-on-surface-variant);

    p {
        margin: 16px 0;
    }
}

.me-row {
    background: var(--mdui-color-primary-container);
    font-weight: bold;

    small {
        font-weight: normal;
        opacity: 0.7;
    }
}
</style>

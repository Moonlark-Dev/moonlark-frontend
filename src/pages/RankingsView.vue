<script setup lang="ts">
import { getRankingByURI, getRankings, type Ranking, type Rankings } from "@/utils/ranking";
import { getSessionIDOrNull } from "@/utils/api";
import { onMounted, ref } from "vue";
import { showToast } from "@/components/ToastComponent.vue";

const rankingData = ref<Record<string, Ranking>>({});
const loading = ref(true);
const error = ref(false);

async function* fetchRankingData() {
    try {
        const rankings: Rankings = await getRankings();
        const entries = Object.entries(rankings);
        if (entries.length === 0) return;
        const race = entries.map(async ([, info]) => [info.name, await getRankingByURI(info.uri)] as [string, Ranking]);
        for (const item of await Promise.allSettled(race)) {
            if (item.status === "fulfilled") yield item.value;
            else {
                showToast("部分排行加载失败", "error");
            }
        }
    } catch {
        error.value = true;
        showToast("排行数据加载失败", "error");
    }
}

onMounted(async () => {
    const entries: Record<string, Ranking> = {};
    for await (const item of fetchRankingData()) {
        if (item) entries[item[0]] = item[1];
    }
    rankingData.value = entries;
    loading.value = false;
});

function showDate(time: number) {
    const date = new Date(time * 1000);
    return ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
}

const loggedIn = getSessionIDOrNull() !== null;
</script>

<template>
    <h1>排行</h1>

    <!-- Loading -->
    <div v-if="loading" class="state-box">
        <mdui-linear-progress indeterminate></mdui-linear-progress>
        <p>正在加载排行数据...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="state-box">
        <mdui-icon name="error_outline" style="font-size: 48px; color: #f44336;"></mdui-icon>
        <p>排行数据加载失败，请稍后重试</p>
        <mdui-button @click="() => { loading = true; error = false; onMounted(() => {}); location.reload(); }">重新加载</mdui-button>
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

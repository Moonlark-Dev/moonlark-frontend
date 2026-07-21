<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { hasAdminConfig, getAdminOverview, getAdminCommands, type StatusOverview } from "@/utils/admin";

const router = useRouter();
const loading = ref(true);
const error = ref("");
const overview = ref<StatusOverview | null>(null);
const commandCount = ref(0);

onMounted(async () => {
    if (!hasAdminConfig()) {
        router.push("/settings");
        return;
    }
    try {
        overview.value = await getAdminOverview();
        const cmds = await getAdminCommands();
        commandCount.value = Object.keys(cmds).length;
    } catch (e: any) {
        error.value = e.message || "加载失败";
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <h1>监控面板</h1>

    <div v-if="loading" class="state-box">
        <mdui-linear-progress indeterminate></mdui-linear-progress>
        <p>正在加载监控数据...</p>
    </div>

    <div v-else-if="error" class="state-box error-box">
        <mdui-icon name="error_outline" style="font-size: 48px; color: #f44336;"></mdui-icon>
        <p>{{ error }}</p>
        <mdui-button @click="router.push('/settings')">前往设置</mdui-button>
    </div>

    <div v-else-if="overview" class="dashboard">
        <!-- 事件统计 -->
        <mdui-card variant="outlined" class="card" @click="router.push('/admin/events')">
            <div class="card-content">
                <mdui-icon name="bar_chart" class="card-icon"></mdui-icon>
                <div>
                    <h3>事件统计</h3>
                    <p>总计 {{ overview.event_counter.total }} | 成功 {{ overview.event_counter.success }} | 失败 {{ overview.event_counter.failed }}</p>
                </div>
            </div>
        </mdui-card>

        <!-- Bot 状态 -->
        <mdui-card variant="outlined" class="card" @click="router.push('/admin/bots')">
            <div class="card-content">
                <mdui-icon name="smart_toy" class="card-icon"></mdui-icon>
                <div>
                    <h3>Bot 状态</h3>
                    <p>共 {{ Object.keys(overview.bots).length }} 个 Bot</p>
                </div>
            </div>
        </mdui-card>

        <!-- 插件 -->
        <mdui-card variant="outlined" class="card" @click="router.push('/admin/plugins')">
            <div class="card-content">
                <mdui-icon name="extension" class="card-icon"></mdui-icon>
                <div>
                    <h3>已加载插件</h3>
                    <p>共 {{ overview.plugins.length }} 个插件</p>
                </div>
            </div>
        </mdui-card>

        <!-- 命令统计 -->
        <mdui-card variant="outlined" class="card" @click="router.push('/admin/commands')">
            <div class="card-content">
                <mdui-icon name="terminal" class="card-icon"></mdui-icon>
                <div>
                    <h3>命令使用统计</h3>
                    <p>共 {{ commandCount }} 个命令</p>
                </div>
            </div>
        </mdui-card>

        <!-- 异常 -->
        <mdui-card variant="outlined" class="card" @click="router.push('/admin/exceptions')">
            <div class="card-content">
                <mdui-icon name="bug_report" class="card-icon"></mdui-icon>
                <div>
                    <h3>异常记录</h3>
                    <p>查看异常记录</p>
                </div>
            </div>
        </mdui-card>

        <!-- OpenAI -->
        <mdui-card variant="outlined" class="card" @click="router.push('/admin/openai')">
            <div class="card-content">
                <mdui-icon name="psychology" class="card-icon"></mdui-icon>
                <div>
                    <h3>OpenAI 历史</h3>
                    <p>查看 OpenAI 请求记录</p>
                </div>
            </div>
        </mdui-card>

        <!-- Handler -->
        <mdui-card variant="outlined" class="card" @click="router.push('/admin/handlers')">
            <div class="card-content">
                <mdui-icon name="playlist_play" class="card-icon"></mdui-icon>
                <div>
                    <h3>Handler 结果</h3>
                    <p>查看 Handler 执行记录</p>
                </div>
            </div>
        </mdui-card>
    </div>
</template>

<style scoped lang="scss">
.state-box {
    text-align: center;
    padding: 40px 20px;
    color: var(--mdui-color-on-surface-variant);
    p { margin: 16px 0; }
}
.error-box p { color: #f44336; }

.dashboard {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
}

.card {
    cursor: pointer;
    transition: transform 0.15s ease;
    &:hover { transform: translateY(-2px); }
}

.card-content {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
}

.card-icon {
    font-size: 40px;
    color: var(--mdui-color-primary);
}

.card-content h3 {
    margin: 0 0 4px;
    font-size: 1.1rem;
}

.card-content p {
    margin: 0;
    color: var(--mdui-color-on-surface-variant);
    font-size: 0.9rem;
}
</style>

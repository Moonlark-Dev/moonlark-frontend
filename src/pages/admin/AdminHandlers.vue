<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { hasAdminConfig, getAdminHandlers, type HandlerResultItem } from "@/utils/admin";

const router = useRouter();
const loading = ref(true);
const error = ref("");
const handlers = ref<HandlerResultItem[]>([]);

onMounted(async () => {
    if (!hasAdminConfig()) { router.push("/settings"); return; }
    try {
        handlers.value = await getAdminHandlers();
    } catch (e: any) {
        error.value = e.message || "加载失败";
    } finally {
        loading.value = false;
    }
});

function resultIcon(result: string): string {
    if (result === "success") return "check_circle";
    if (result === "failed") return "error";
    return "skip_next";
}

function resultColor(result: string): string {
    if (result === "success") return "#4caf50";
    if (result === "failed") return "#f44336";
    return "#ff9800";
}
</script>

<template>
    <h1>Handler 结果</h1>
    <mdui-button variant="text" @click="router.push('/admin')">← 返回面板</mdui-button>

    <div v-if="loading" class="state-box">
        <mdui-linear-progress indeterminate></mdui-linear-progress>
        <p>正在加载...</p>
    </div>
    <div v-else-if="error" class="state-box error"><p>{{ error }}</p></div>
    <div v-else-if="handlers.length === 0" class="state-box">
        <p>暂无数据</p>
    </div>
    <mdui-list v-else>
        <mdui-collapse accordion>
            <mdui-collapse-item v-for="(h, i) of handlers" :key="i">
                <mdui-list-item slot="header">
                    <div class="handler-summary">
                        <strong>{{ h.command_name }}</strong>
                        <small>{{ h.matcher.slice(0, 60) }}...</small>
                        <small class="msg-preview">{{ h.message.slice(0, 30) }}</small>
                    </div>
                </mdui-list-item>
                <div class="handler-detail">
                    <p><strong>命令:</strong> {{ h.command_name }}</p>
                    <p><strong>消息:</strong> {{ h.message }}</p>
                    <p><strong>匹配器:</strong> <code>{{ h.matcher }}</code></p>
                    <h4>执行结果 ({{ h.result.length }})</h4>
                    <mdui-list>
                        <mdui-list-item v-for="(r, j) of h.result" :key="j">
                            <div class="run-result">
                                <mdui-icon :name="resultIcon(r.result)" :style="{ color: resultColor(r.result) }"></mdui-icon>
                                <div>
                                    <strong>{{ r.handler.name }}</strong> ({{ r.handler.plugin }})
                                    <small>{{ r.message }}</small>
                                </div>
                            </div>
                        </mdui-list-item>
                    </mdui-list>
                </div>
            </mdui-collapse-item>
        </mdui-collapse>
    </mdui-list>
</template>

<style scoped lang="scss">
.state-box { text-align: center; padding: 40px 20px; p { margin: 16px 0; } }
.error p { color: #f44336; }

.handler-summary {
    display: flex;
    flex-direction: column;
    gap: 4px;
    small { color: var(--mdui-color-on-surface-variant); font-size: 0.8rem; }
    .msg-preview { color: var(--mdui-color-on-surface-variant); }
}

.handler-detail {
    padding: 16px;
    code {
        background: var(--mdui-color-surface-container);
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.85rem;
    }
    h4 { margin: 12px 0 8px; }
}

.run-result {
    display: flex;
    align-items: center;
    gap: 12px;
    small { display: block; color: var(--mdui-color-on-surface-variant); font-size: 0.8rem; }
}
</style>

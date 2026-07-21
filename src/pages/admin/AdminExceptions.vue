<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { hasAdminConfig, getAdminExceptions, type ExceptionItem } from "@/utils/admin";

const router = useRouter();
const loading = ref(true);
const error = ref("");
const exceptions = ref<ExceptionItem[]>([]);

onMounted(async () => {
    if (!hasAdminConfig()) { router.push("/settings"); return; }
    try {
        exceptions.value = await getAdminExceptions();
    } catch (e: any) {
        error.value = e.message || "加载失败";
    } finally {
        loading.value = false;
    }
});

function formatTime(ts: number): string {
    return new Date(ts * 1000).toLocaleString();
}
</script>

<template>
    <h1>异常记录</h1>
    <mdui-button variant="text" @click="router.push('/admin')">← 返回面板</mdui-button>

    <div v-if="loading" class="state-box">
        <mdui-linear-progress indeterminate></mdui-linear-progress>
        <p>正在加载...</p>
    </div>
    <div v-else-if="error" class="state-box error"><p>{{ error }}</p></div>
    <div v-else-if="exceptions.length === 0" class="state-box">
        <mdui-icon name="check_circle" style="font-size: 48px; color: #4caf50;"></mdui-icon>
        <p>暂无异常记录</p>
    </div>
    <mdui-list v-else>
        <mdui-collapse accordion>
            <mdui-collapse-item v-for="(exc, i) of exceptions" :key="i">
                <mdui-list-item slot="header">
                    <div class="exc-summary">
                        <mdui-icon name="error" style="color:#f44336; font-size: 20px;"></mdui-icon>
                        <div>
                            <strong>{{ exc.bot_id }}</strong>
                            <small>{{ formatTime(exc.timestamp) }}</small>
                        </div>
                    </div>
                </mdui-list-item>
                <div class="exc-detail">
                    <p v-if="exc.message"><strong>消息:</strong> {{ exc.message }}</p>
                    <p v-if="exc.session"><strong>会话:</strong> {{ exc.session }}</p>
                    <pre>{{ exc.exception }}</pre>
                </div>
            </mdui-collapse-item>
        </mdui-collapse>
    </mdui-list>
</template>

<style scoped lang="scss">
.state-box { text-align: center; padding: 40px 20px; p { margin: 16px 0; } }
.error p { color: #f44336; }
.exc-summary {
    display: flex;
    align-items: center;
    gap: 12px;
    small { color: var(--mdui-color-on-surface-variant); margin-left: 8px; }
}
.exc-detail {
    padding: 16px;
    pre {
        background: var(--mdui-color-surface-container);
        padding: 12px;
        border-radius: 8px;
        overflow-x: auto;
        font-size: 0.8rem;
        max-height: 300px;
        overflow-y: auto;
    }
}
</style>

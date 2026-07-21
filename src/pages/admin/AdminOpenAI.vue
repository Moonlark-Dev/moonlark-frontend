<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { hasAdminConfig, getAdminOpenAI, type OpenAIHistoryItem } from "@/utils/admin";

const router = useRouter();
const loading = ref(true);
const error = ref("");
const items = ref<OpenAIHistoryItem[]>([]);

onMounted(async () => {
    if (!hasAdminConfig()) { router.push("/settings"); return; }
    try {
        items.value = await getAdminOpenAI();
    } catch (e: any) {
        error.value = e.message || "加载失败";
    } finally {
        loading.value = false;
    }
});

function isLongContent(content: string): boolean {
    return content.length > 200;
}
</script>

<template>
    <h1>OpenAI 历史</h1>
    <mdui-button variant="text" @click="router.push('/admin')">← 返回面板</mdui-button>

    <div v-if="loading" class="state-box">
        <mdui-linear-progress indeterminate></mdui-linear-progress>
        <p>正在加载...</p>
    </div>
    <div v-else-if="error" class="state-box error"><p>{{ error }}</p></div>
    <div v-else-if="items.length === 0" class="state-box">
        <p>暂无记录</p>
    </div>
    <mdui-list v-else>
        <mdui-collapse accordion>
            <mdui-collapse-item v-for="(item, i) of items" :key="i">
                <mdui-list-item slot="header">
                    <div class="ai-summary">
                        <mdui-icon name="psychology"></mdui-icon>
                        <div>
                            <strong>{{ item.model }}</strong> — <small>{{ item.identify }}</small>
                            <small class="msg-count">{{ item.messages.length }} 条消息</small>
                        </div>
                    </div>
                </mdui-list-item>
                <div class="ai-detail">
                    <mdui-list>
                        <mdui-list-item v-for="(msg, j) of item.messages" :key="j">
                            <div class="msg-item">
                                <span class="msg-role">{{ msg.role || 'unknown' }}</span>
                                <span class="msg-content" v-if="typeof msg.content === 'string' && !isLongContent(msg.content)">
                                    {{ msg.content }}
                                </span>
                                <span v-else-if="typeof msg.content === 'string'">
                                    {{ msg.content.slice(0, 200) }}...
                                </span>
                                <span v-else>
                                    {{ JSON.stringify(msg.content).slice(0, 200) }}...
                                </span>
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

.ai-summary {
    display: flex;
    align-items: center;
    gap: 12px;
    .msg-count {
        margin-left: 8px;
        color: var(--mdui-color-on-surface-variant);
    }
}

.ai-detail { padding: 8px 16px; }

.msg-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
}

.msg-role {
    font-weight: bold;
    font-size: 0.85rem;
    color: var(--mdui-color-primary);
}

.msg-content {
    font-size: 0.9rem;
    word-break: break-all;
}
</style>

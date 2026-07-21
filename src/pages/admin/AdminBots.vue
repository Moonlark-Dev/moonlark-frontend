<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { hasAdminConfig, getAdminBots, type BotStatus } from "@/utils/admin";

const router = useRouter();
const loading = ref(true);
const error = ref("");
const bots = ref<Record<string, BotStatus>>({});

onMounted(async () => {
    if (!hasAdminConfig()) { router.push("/settings"); return; }
    try {
        bots.value = await getAdminBots();
    } catch (e: any) {
        error.value = e.message || "加载失败";
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <h1>Bot 状态</h1>
    <mdui-button variant="text" @click="router.push('/admin')">← 返回面板</mdui-button>

    <div v-if="loading" class="state-box">
        <mdui-linear-progress indeterminate></mdui-linear-progress>
        <p>正在加载...</p>
    </div>
    <div v-else-if="error" class="state-box error"><p>{{ error }}</p></div>
    <div v-else>
        <mdui-list>
            <mdui-list-item v-for="(bot, code) of bots" :key="code">
                <div class="bot-item">
                    <mdui-icon :name="bot.online ? 'check_circle' : 'cancel'" 
                        :style="{ color: bot.online ? '#4caf50' : '#f44336' }"></mdui-icon>
                    <div class="bot-info">
                        <strong>{{ code }}</strong>
                        <small class="bot-detail">
                            {{ bot.nickname || "未知" }} | {{ bot.adapter_name || "未知适配器" }}
                            <span v-if="bot.good !== undefined"> | {{ bot.good ? "正常" : "异常" }}</span>
                        </small>
                    </div>
                </div>
            </mdui-list-item>
        </mdui-list>
    </div>
</template>

<style scoped lang="scss">
.state-box { text-align: center; padding: 40px 20px; p { margin: 16px 0; } }
.error p { color: #f44336; }
.bot-item {
    display: flex;
    align-items: center;
    gap: 12px;
}
.bot-info {
    display: flex;
    flex-direction: column;
}
.bot-detail { color: var(--mdui-color-on-surface-variant); font-size: 0.85rem; }
</style>

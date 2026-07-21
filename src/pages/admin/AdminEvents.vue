<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { hasAdminConfig, getAdminEvents, type EventCounter } from "@/utils/admin";

const router = useRouter();
const loading = ref(true);
const error = ref("");
const events = ref<EventCounter | null>(null);

onMounted(async () => {
    if (!hasAdminConfig()) { router.push("/settings"); return; }
    try {
        events.value = await getAdminEvents();
    } catch (e: any) {
        error.value = e.message || "加载失败";
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <h1>事件统计</h1>
    <mdui-button variant="text" @click="router.push('/admin')">← 返回面板</mdui-button>

    <div v-if="loading" class="state-box">
        <mdui-linear-progress indeterminate></mdui-linear-progress>
        <p>正在加载...</p>
    </div>
    <div v-else-if="error" class="state-box error"><p>{{ error }}</p></div>
    <div v-else-if="events" class="stats-grid">
        <mdui-card variant="outlined" class="stat-card total">
            <h3>总计</h3>
            <p class="stat-value">{{ events.total }}</p>
        </mdui-card>
        <mdui-card variant="outlined" class="stat-card success">
            <h3>成功</h3>
            <p class="stat-value">{{ events.success }}</p>
        </mdui-card>
        <mdui-card variant="outlined" class="stat-card failed">
            <h3>失败</h3>
            <p class="stat-value">{{ events.failed }}</p>
        </mdui-card>
    </div>
</template>

<style scoped lang="scss">
.state-box { text-align: center; padding: 40px 20px; p { margin: 16px 0; } }
.error p { color: #f44336; }

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
}

.stat-card {
    padding: 24px;
    text-align: center;
    h3 { margin: 0 0 8px; font-size: 1rem; color: var(--mdui-color-on-surface-variant); }
    .stat-value { margin: 0; font-size: 2.5rem; font-weight: bold; }
}

.total .stat-value { color: var(--mdui-color-primary); }
.success .stat-value { color: #4caf50; }
.failed .stat-value { color: #f44336; }
</style>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { hasAdminConfig, getAdminCommands } from "@/utils/admin";

const router = useRouter();
const loading = ref(true);
const error = ref("");
const commands = ref<Record<string, number>>({});

const sortedCommands = computed(() =>
    Object.entries(commands.value)
        .sort(([, a], [, b]) => b - a)
);

onMounted(async () => {
    if (!hasAdminConfig()) { router.push("/settings"); return; }
    try {
        commands.value = await getAdminCommands();
    } catch (e: any) {
        error.value = e.message || "加载失败";
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <h1>命令使用统计</h1>
    <mdui-button variant="text" @click="router.push('/admin')">← 返回面板</mdui-button>

    <div v-if="loading" class="state-box">
        <mdui-linear-progress indeterminate></mdui-linear-progress>
        <p>正在加载...</p>
    </div>
    <div v-else-if="error" class="state-box error"><p>{{ error }}</p></div>
    <div v-else-if="sortedCommands.length === 0" class="state-box">
        <p>暂无数据</p>
    </div>
    <mdui-list v-else>
        <mdui-list-item v-for="[cmd, count] of sortedCommands" :key="cmd">
            <div class="cmd-item">
                <span class="cmd-name">{{ cmd }}</span>
                <span class="cmd-count">{{ count }} 次</span>
            </div>
        </mdui-list-item>
    </mdui-list>
</template>

<style scoped lang="scss">
.state-box { text-align: center; padding: 40px 20px; p { margin: 16px 0; } }
.error p { color: #f44336; }

.cmd-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.cmd-name {
    font-family: monospace;
    font-size: 0.95rem;
}

.cmd-count {
    color: var(--mdui-color-primary);
    font-weight: bold;
}
</style>

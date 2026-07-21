<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { hasAdminConfig, getAdminPlugins } from "@/utils/admin";

const router = useRouter();
const loading = ref(true);
const error = ref("");
const plugins = ref<string[]>([]);

onMounted(async () => {
    if (!hasAdminConfig()) { router.push("/settings"); return; }
    try {
        plugins.value = await getAdminPlugins();
    } catch (e: any) {
        error.value = e.message || "加载失败";
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <h1>已加载插件</h1>
    <mdui-button variant="text" @click="router.push('/admin')">← 返回面板</mdui-button>

    <div v-if="loading" class="state-box">
        <mdui-linear-progress indeterminate></mdui-linear-progress>
        <p>正在加载...</p>
    </div>
    <div v-else-if="error" class="state-box error"><p>{{ error }}</p></div>
    <div v-else-if="plugins.length === 0" class="state-box">
        <p>暂无插件数据</p>
    </div>
    <mdui-list v-else>
        <mdui-list-item v-for="(p, i) of plugins" :key="i">
            <div class="plugin-item">
                <mdui-icon name="extension"></mdui-icon>
                <span>{{ p }}</span>
            </div>
        </mdui-list-item>
    </mdui-list>
</template>

<style scoped lang="scss">
.state-box { text-align: center; padding: 40px 20px; p { margin: 16px 0; } }
.error p { color: #f44336; }
.plugin-item {
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: monospace;
}
</style>

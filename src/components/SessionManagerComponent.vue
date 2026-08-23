<script setup lang="ts">
import { apiRequest } from '@/utils/api';
import { logout as performLogout, type SessionInfo } from '@/utils/user';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from '@/components/ToastComponent.vue';

// 登录设备管理：列出当前账号的全部活跃会话，可踢掉任意设备；
// 踢掉当前设备等同于登出（服务端会话已删除，本地凭据随之清理）。

const router = useRouter();
const sessions = ref<SessionInfo[]>([]);
const loading = ref(false);
const loadError = ref(false);
const removing = ref<string | null>(null);

function formatTime(epoch: number | null): string {
    if (!epoch) return "未知";
    return new Date(epoch * 1000).toLocaleString();
}

function deviceLabel(item: SessionInfo): string {
    if (item.device) return item.device.length > 56 ? `${item.device.slice(0, 56)}…` : item.device;
    return "未知设备（旧版会话）";
}

async function refresh() {
    loading.value = true;
    loadError.value = false;
    try {
        sessions.value = await apiRequest<SessionInfo[]>("/sessions");
    } catch {
        loadError.value = true;
    } finally {
        loading.value = false;
    }
}

async function kick(item: SessionInfo) {
    if (removing.value) return;
    removing.value = item.session_id;
    try {
        await apiRequest(`/sessions/${item.session_id}`, { method: "DELETE" });
        if (item.current) {
            // 踢掉的是当前设备：服务端会话已删除，清理本地凭据并回登录页
            await performLogout();
            router.push('/login');
            return;
        }
        showToast("已移除该设备", "success");
        await refresh();
    } catch {
        showToast("移除失败，请稍后重试", "error");
    } finally {
        removing.value = null;
    }
}

onMounted(refresh);
</script>

<template>
    <h2>登录设备</h2>
    <p>以下设备正在使用你的账号。发现不认识的设备请立即移除。</p>
    <mdui-button variant="text" :disabled="loading" @click="refresh()">
        <mdui-icon slot="icon" name="refresh"></mdui-icon>刷新
    </mdui-button>
    <p v-if="loadError">列表加载失败，请点击刷新重试。</p>
    <mdui-list>
        <mdui-list-item v-for="item in sessions" :key="item.session_id" nonclickable>
            <mdui-icon slot="icon"
                :name="item.current ? 'phonelink_setup' : item.device && /Mobile|Android|iPhone/i.test(item.device) ? 'smartphone' : 'computer'"></mdui-icon>
            <span>{{ deviceLabel(item) }}</span>
            <span v-if="item.current" style="color: #4caf50;">（当前设备）</span>
            <span slot="description">登录于 {{ formatTime(item.created_at) }} · 最近活跃 {{ formatTime(item.last_active_at) }}</span>
            <mdui-button slot="end-icon" icon="logout" variant="text" :disabled="removing === item.session_id"
                @click="kick(item)">移除</mdui-button>
        </mdui-list-item>
    </mdui-list>
</template>

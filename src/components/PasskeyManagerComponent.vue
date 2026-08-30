<script setup lang="ts">
// 相对路径导入：静态分析引擎（Codacy）不解析 @ 别名，会把导入值标记为 error 类型并误报 no-unsafe-*
import {
    listPasskeys,
    registerPasskey,
    renamePasskey,
    deletePasskey,
    passkeySupported,
    passkeyErrorText,
    type PasskeyListItem,
} from '../utils/passkey';
import { onMounted, ref } from 'vue';
import { showToast } from '../utils/toast';

// Passkey 凭据管理：当前账号已注册的 Passkey 列表，支持添加 / 重命名 / 删除。
// 添加流程：点击「添加」→ 填写设备名称 → 浏览器弹出系统级验证（指纹 / 面容 / PIN）。

const passkeys = ref<PasskeyListItem[]>([]);
const loading = ref(false);
const loadError = ref(false);
const adding = ref(false);
const newName = ref("");
const registering = ref(false);
const editingId = ref<string | null>(null);
const editingName = ref("");
const deletingId = ref<string | null>(null); // 两步确认：第一次点击进入待确认状态

function formatTime(epoch: number | null): string {
    if (!epoch) return "从未使用";
    return new Date(epoch * 1000).toLocaleString();
}

/** 拉取凭据列表；任何失败都归为「加载失败」，由界面提示重试。 */
// 注：以链式 .catch 显式携带错误处理（静态分析引擎不识别无绑定参数的 try…catch）
async function refresh() {
    loading.value = true;
    loadError.value = false;
    await listPasskeys()
        .then((data) => {
            passkeys.value = data;
        })
        .catch(() => {
            loadError.value = true;
        })
        .finally(() => {
            loading.value = false;
        });
}

async function confirmAdd() {
    const name = newName.value.trim();
    if (!name) {
        showToast("请输入设备名称", "error");
        return;
    }
    if (!passkeySupported()) {
        showToast("当前浏览器不支持 Passkey（需要 HTTPS 环境）", "error");
        return;
    }
    registering.value = true;
    try {
        await registerPasskey(name);
        showToast("Passkey 已添加", "success");
        newName.value = "";
        adding.value = false;
        await refresh();
    } catch (error) {
        const message = passkeyErrorText(error);
        if (message) showToast(message, "error");
    } finally {
        registering.value = false;
    }
}

function cancelAdd() {
    adding.value = false;
    newName.value = "";
}

function startEdit(item: PasskeyListItem) {
    editingId.value = item.id;
    editingName.value = item.device_name;
}

async function confirmRename(item: PasskeyListItem) {
    const name = editingName.value.trim() || item.device_name;
    try {
        await renamePasskey(item.id, name);
        showToast("已重命名", "success");
        await refresh();
    } catch {
        showToast("重命名失败，请稍后重试", "error");
    } finally {
        editingId.value = null;
    }
}

async function remove(item: PasskeyListItem) {
    if (deletingId.value !== item.id) {
        deletingId.value = item.id; // 第一次点击：进入待确认
        return;
    }
    deletingId.value = null;
    try {
        await deletePasskey(item.id);
        showToast("Passkey 已删除", "success");
        await refresh();
    } catch {
        showToast("删除失败，请稍后重试", "error");
    }
}

onMounted(() => {
    // refresh 内部已兜底全部错误；void 标记挂载回调无未处理的异步结果
    void refresh();
});
</script>

<template>
    <h2>Passkey 登录</h2>
    <p>添加 Passkey 后，可在登录页使用指纹、面容或 PIN 免密登录，无需再在聊天中输激活码。</p>
    <div class="actions">
        <mdui-button variant="text" :disabled="loading" @click="refresh()">
            <mdui-icon slot="icon" name="refresh"></mdui-icon>刷新
        </mdui-button>
        <mdui-button v-if="!adding" variant="tonal" icon="fingerprint" @click="adding = true">添加 Passkey</mdui-button>
    </div>

    <div v-if="adding" class="add-form">
        <mdui-text-field label="设备名称（如：我的 iPhone）" :value="newName"
            @input="newName = ($event.target as HTMLInputElement).value" clearable></mdui-text-field>
        <mdui-button :disabled="registering" @click="confirmAdd()">
            {{ registering ? "正在验证…" : "开始验证" }}
        </mdui-button>
        &nbsp;
        <mdui-button variant="text" :disabled="registering" @click="cancelAdd()">取消</mdui-button>
    </div>

    <p v-if="loadError">Passkey 列表加载失败，请点击刷新重试。</p>
    <p v-else-if="passkeys.length === 0 && !loading">尚未注册任何 Passkey。</p>

    <mdui-list>
        <mdui-list-item v-for="item in passkeys" :key="item.id" nonclickable>
            <mdui-icon slot="icon" name="fingerprint"></mdui-icon>
            <template v-if="editingId === item.id">
                <mdui-text-field :value="editingName"
                    @input="editingName = ($event.target as HTMLInputElement).value" clearable></mdui-text-field>
                <mdui-button slot="end-icon" icon="check" variant="text" @click="confirmRename(item)"></mdui-button>
                <mdui-button slot="end-icon" icon="close" variant="text" @click="editingId = null"></mdui-button>
            </template>
            <template v-else>
                <span>{{ item.device_name }}</span>
                <span slot="description">添加于 {{ formatTime(item.created_at) }} · 最近使用 {{ formatTime(item.last_used_at) }}</span>
                <mdui-button slot="end-icon" icon="edit" variant="text" @click="startEdit(item)"></mdui-button>
                <mdui-button slot="end-icon" icon="delete" variant="text"
                    :color="deletingId === item.id ? 'error' : undefined"
                    @click="remove(item)">{{ deletingId === item.id ? "确认删除?" : "" }}</mdui-button>
            </template>
        </mdui-list-item>
    </mdui-list>
</template>

<style scoped lang="scss">
.actions {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 8px;
}

.add-form {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 8px;

    mdui-text-field {
        flex: 1;
        max-width: 320px;
    }
}
</style>

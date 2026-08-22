<script lang="ts">
// showToast 需要在组件外部导入使用，因此放在普通 <script> 块中导出
import { defineComponent, ref } from "vue";

interface ToastMessage {
    id: number;
    text: string;
    type: "info" | "success" | "error";
}

const messages = ref<ToastMessage[]>([]);
let nextId = 0;

export function showToast(text: string, type: "info" | "success" | "error" = "info") {
    const id = nextId++;
    messages.value.push({ id, text, type });
    setTimeout(() => {
        messages.value = messages.value.filter((m) => m.id !== id);
    }, 3000);
}

export default defineComponent({
    name: "ToastComponent",
    setup() {
        return { messages };
    }
});
</script>

<template>
    <div class="toast-container">
        <mdui-snackbar
            v-for="msg of messages"
            :key="msg.id"
            :class="'toast-' + msg.type"
            closeable
        >
            {{ msg.text }}
        </mdui-snackbar>
    </div>
</template>

<style scoped lang="scss">
.toast-container {
    position: fixed;
    top: 16px;
    right: 16px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-width: 360px;
    pointer-events: none;

    > * {
        pointer-events: auto;
    }
}

.toast-success {
    --mdui-color-primary: #4caf50;
}

.toast-error {
    --mdui-color-primary: #f44336;
}
</style>

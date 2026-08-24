<script lang="ts">
// showToast 已拆分至 ../utils/toast（逻辑与视图分离）；
// 此处保留再导出以兼容既有导入方，本组件只负责渲染。
import { defineComponent } from "vue";
import { messages } from "../utils/toast";

export { showToast } from "../utils/toast";

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

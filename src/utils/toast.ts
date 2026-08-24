// ── 全局 Toast 状态 ──
// 逻辑与视图分离：ToastComponent.vue 只负责渲染，任意模块可直接导入 showToast。
// （放在纯 TS 模块而非 .vue 文件中，静态分析引擎才能正确解析其类型。）

import { ref } from "vue";

export interface ToastMessage {
    id: number;
    text: string;
    type: "info" | "success" | "error";
}

export const messages = ref<ToastMessage[]>([]);
let nextId = 0;

export function showToast(text: string, type: "info" | "success" | "error" = "info") {
    const id = nextId++;
    messages.value.push({ id, text, type });
    setTimeout(() => {
        messages.value = messages.value.filter((m) => m.id !== id);
    }, 3000);
}

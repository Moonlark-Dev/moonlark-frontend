import 'mdui/mdui.css';
import 'mdui';
import "./styles/index.scss";
import { createApp } from 'vue';
import App from './App.vue';
import { setColorScheme } from 'mdui/functions/setColorScheme';
import router from "./routes";
import { setAuthErrorHandler } from "./utils/api";

setColorScheme('#66ccff');

// 会话失效（401）时统一跳转登录页并记录回跳地址。
// 登录页自身发起的请求（激活等待轮询等）出现 401 属预期流程，不重复跳转。
setAuthErrorHandler(() => {
    const current = router.currentRoute.value;
    if (current.path === '/login') return;
    router.push({ path: '/login', query: { redirect: current.fullPath } });
});

createApp(App).use(router).mount('#app');

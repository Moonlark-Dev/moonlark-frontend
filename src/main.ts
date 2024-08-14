import 'mdui/mdui.css';
import 'mdui';
import "./styles/index.scss";

import { createApp } from 'vue';
import App from './App.vue';
import { setColorScheme } from 'mdui/functions/setColorScheme';
import router from "./routes";

setColorScheme('#66ccff');
createApp(App).use(router).mount('#app');

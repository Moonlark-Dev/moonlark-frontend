import 'mdui/mdui.css';
import 'mdui';

import { createApp } from 'vue';
import App from './App.vue';
import { setColorScheme } from 'mdui/functions/setColorScheme.js';

import Home from './pages/Home.vue';
import User from './pages/User.vue';
import Login from './pages/Login.vue';
import { createRouter, createWebHistory } from 'vue-router';


const routes = [
  { path: '/', component: Home },
  { path: '/user', component: User },
  { path: '/login', component: Login }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

setColorScheme('#66ccff');
createApp(App).use(router).mount('#app');

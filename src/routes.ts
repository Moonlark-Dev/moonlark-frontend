import { createRouter, createWebHashHistory, type RouteRecordRaw } from "vue-router";

import HomeView from "@/pages/HomeView.vue";
import UserView from "@/pages/UserView.vue";
import LoginView from "@/pages/LoginView.vue";
import SettingsView from "@/pages/SettingsView.vue";
import RankingsView from "@/pages/RankingsView.vue";

export const routes: RouteRecordRaw[] = [
    { path: '/', component: HomeView, name: "home" },
    { path: '/user', component: UserView, name: "user" },
    { path: '/login', component: LoginView, name: "login" },
    { path: '/settings', component: SettingsView, name: "settings" },
    { path: '/rankings', component: RankingsView, name: "rankings" }
];

export const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export default router;

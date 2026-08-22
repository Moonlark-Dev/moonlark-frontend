import { createRouter, createWebHashHistory, type RouteRecordRaw } from "vue-router";

import HomeView from "@/pages/HomeView.vue";
import UserView from "@/pages/UserView.vue";
import LoginView from "@/pages/LoginView.vue";
import SettingsView from "@/pages/SettingsView.vue";
import RankingsView from "@/pages/RankingsView.vue";
import HelpView from "@/pages/HelpView.vue";
import AdminMenuPanelView from "@/pages/AdminMenuPanelView.vue";

export const routes: RouteRecordRaw[] = [
    { path: '/', component: HomeView, name: "home" },
    { path: '/user', component: UserView, name: "user" },
    { path: '/login', component: LoginView, name: "login" },
    { path: '/settings', component: SettingsView, name: "settings" },
    { path: '/rankings', component: RankingsView, name: "rankings" },
    { path: '/help', component: HelpView, name: "help" },
    { path: '/admin/menupanel', component: AdminMenuPanelView, name: "admin-menupanel" }
];

export const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export default router;

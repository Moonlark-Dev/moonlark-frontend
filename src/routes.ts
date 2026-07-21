import { createRouter, createWebHashHistory, type RouteRecordRaw } from "vue-router";

import HomeView from "@/pages/HomeView.vue";
import UserView from "@/pages/UserView.vue";
import LoginView from "@/pages/LoginView.vue";
import SettingsView from "@/pages/SettingsView.vue";
import RankingsView from "@/pages/RankingsView.vue";

import AdminOverview from "@/pages/admin/AdminOverview.vue";
import AdminBots from "@/pages/admin/AdminBots.vue";
import AdminExceptions from "@/pages/admin/AdminExceptions.vue";
import AdminPlugins from "@/pages/admin/AdminPlugins.vue";
import AdminEvents from "@/pages/admin/AdminEvents.vue";
import AdminCommands from "@/pages/admin/AdminCommands.vue";
import AdminOpenAI from "@/pages/admin/AdminOpenAI.vue";
import AdminHandlers from "@/pages/admin/AdminHandlers.vue";

export const routes: RouteRecordRaw[] = [
    { path: '/', component: HomeView, name: "home" },
    { path: '/user', component: UserView, name: "user" },
    { path: '/login', component: LoginView, name: "login" },
    { path: '/settings', component: SettingsView, name: "settings" },
    { path: '/rankings', component: RankingsView, name: "rankings" },
    { path: '/admin', component: AdminOverview, name: "admin" },
    { path: '/admin/bots', component: AdminBots, name: "admin-bots" },
    { path: '/admin/exceptions', component: AdminExceptions, name: "admin-exceptions" },
    { path: '/admin/plugins', component: AdminPlugins, name: "admin-plugins" },
    { path: '/admin/events', component: AdminEvents, name: "admin-events" },
    { path: '/admin/commands', component: AdminCommands, name: "admin-commands" },
    { path: '/admin/openai', component: AdminOpenAI, name: "admin-openai" },
    { path: '/admin/handlers', component: AdminHandlers, name: "admin-handlers" },
];

export const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export default router;

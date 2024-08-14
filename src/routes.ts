import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
    { path: '/', component: import("./pages/HomeView.vue"), name: "home" },
    { path: '/user', component: import("./pages/UserView.vue"), name: "user" },
    { path: '/login', component: import("./pages/LoginView.vue"), name: "login" },
    { path: '/settings', component: import("./pages/SettingsView.vue"), name: "settings" },
    { path: '/rankings', component: import("./pages/RankingsView.vue"), name: "rankings" }
];

export const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;

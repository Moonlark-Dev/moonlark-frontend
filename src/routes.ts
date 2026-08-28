import { createRouter, createWebHashHistory, type RouteRecordRaw } from "vue-router";

import HomeView from "@/pages/HomeView.vue";
import UserView from "@/pages/UserView.vue";
import LoginView from "@/pages/LoginView.vue";
import SettingsView from "@/pages/SettingsView.vue";
import RankingsView from "@/pages/RankingsView.vue";
import HelpView from "@/pages/HelpView.vue";
import AdminMenuPanelView from "@/pages/AdminMenuPanelView.vue";

declare module 'vue-router' {
    interface RouteMeta {
        /** 标记为管理后台页面：超级管理员登录时会在主页展示入口 */
        admin?: boolean;
        /** 管理页面在主页入口中显示的标题 */
        title?: string;
        /** 管理页面在主页入口中显示的描述 */
        description?: string;
        /** 管理页面在主页入口中显示的图标 */
        icon?: string;
    }
}

export const routes: RouteRecordRaw[] = [
    { path: '/', component: HomeView, name: "home" },
    { path: '/user', component: UserView, name: "user" },
    { path: '/login', component: LoginView, name: "login" },
    { path: '/settings', component: SettingsView, name: "settings" },
    { path: '/rankings', component: RankingsView, name: "rankings" },
    { path: '/help', component: HelpView, name: "help" },
    {
        path: '/admin/menupanel',
        component: AdminMenuPanelView,
        name: "admin-menupanel",
        meta: {
            admin: true,
            title: "QQ 菜单/指令面板管理",
            description: "配置 QQ 自定义菜单与指令面板展示的指令",
            icon: "admin_panel_settings",
        },
    }
];

export const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export default router;

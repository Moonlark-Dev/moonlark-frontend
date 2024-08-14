import { createRouter, createWebHistory } from "vue-router";
import Home from './pages/HomeView.vue';
import User from './pages/UserView.vue';
import Login from './pages/LoginView.vue';
import Settings from './pages/SettingsView.vue';

export const routes = [
	{ path: '/', component: Home },
	{ path: '/user', component: User },
	{ path: '/login', component: Login },
	{ path: '/settings', component: Settings }
];

export const router = createRouter({
	history: createWebHistory(),
	routes,
});

export default router;

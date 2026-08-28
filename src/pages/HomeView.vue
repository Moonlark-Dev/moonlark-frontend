<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getCurrentUser, isLoggedIn } from '@/utils/user';
import { isSuperuser } from '@/utils/menupanel';

const router = useRouter();
const nickname = ref("用户");
const superuser = ref(false);

// 管理后台页面入口：所有 meta.admin 为 true 的路由（如 /admin/menupanel），
// 后续新增类似管理页面时只需在路由上标记 meta.admin，主页入口会自动出现
const adminEntries = computed(() =>
	router.getRoutes().filter(route => route.meta.admin === true)
);

onMounted(async () => {
	if (!await isLoggedIn()) {
		nickname.value = "未登录用户";
		return;
	}
	try {
		const user = await getCurrentUser();
		if (user) nickname.value = user.nickname || "未登录用户";
		superuser.value = await isSuperuser();
	} catch {
		nickname.value = "未登录用户";
	}
});
</script>

<template>
	<h1>主页</h1>
	<p>欢迎回来，{{ nickname }}！</p>
	<mdui-card v-if="superuser && adminEntries.length" variant="outlined" class="admin-card">
		<h2>超级管理员</h2>
		<p class="hint">以下管理功能仅超级管理员可见：</p>
		<mdui-list>
			<mdui-list-item v-for="entry of adminEntries" :key="entry.path"
							:icon="String(entry.meta.icon ?? 'admin_panel_settings')"
							end-icon="arrow_forward"
							@click="router.push(entry.path)">
				{{ entry.meta.title }}
				<span v-if="entry.meta.description" slot="description">{{ entry.meta.description }}</span>
			</mdui-list-item>
		</mdui-list>
	</mdui-card>
</template>

<style scoped lang="scss">
.admin-card {
	padding: 20px;
	width: 67%;
}

.hint {
	color: rgb(var(--mdui-color-on-surface-variant));
	font-size: 14px;
}

@media (max-width: 767px) {
	.admin-card {
		width: 100%;
	}
}
</style>

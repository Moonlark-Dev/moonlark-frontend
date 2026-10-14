<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getCurrentUser, isLoggedIn } from '@/utils/user';
import { isSuperuser } from '@/utils/menupanel';
import { fetchLatestUpdate, type UpdateAnnouncement } from '@/utils/updates';

const router = useRouter();
const nickname = ref("用户");
const superuser = ref(false);
const announcement = ref<UpdateAnnouncement | null>(null);

// 管理后台页面入口：所有 meta.admin 为 true 的路由（如 /admin/menupanel），
// 后续新增类似管理页面时只需在路由上标记 meta.admin，主页入口会自动出现
const adminEntries = computed(() =>
	router.getRoutes().filter(route => route.meta.admin === true)
);

function formatAnnouncementTime(time: number): string {
	return new Date(time * 1000).toLocaleString();
}

onMounted(async () => {
	if (!await isLoggedIn()) {
		nickname.value = "未登录用户";
	} else {
		try {
			const user = await getCurrentUser();
			if (user) nickname.value = user.nickname || "未登录用户";
			superuser.value = await isSuperuser();
		} catch {
			nickname.value = "未登录用户";
		}
	}
	// 更新公告为公开接口，未登录也展示
	try {
		announcement.value = await fetchLatestUpdate();
	} catch {
		// 公告加载失败不影响首页其他内容
	}
});
</script>

<template>
	<h1>主页</h1>
	<p>欢迎回来，{{ nickname }}！</p>
	<mdui-card v-if="announcement" variant="outlined" class="announcement-card">
		<h2>最新更新 · {{ announcement.title }}</h2>
		<p class="hint">更新时间：{{ formatAnnouncementTime(announcement.time) }}</p>
		<p class="announcement-content">{{ announcement.content }}</p>
	</mdui-card>
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

.announcement-card {
	padding: 20px;
	width: 67%;
	margin-bottom: 16px;
}

.announcement-card h2 {
	margin-top: 0;
}

.announcement-content {
	white-space: pre-wrap;
	word-break: break-word;
}

.hint {
	color: rgb(var(--mdui-color-on-surface-variant));
	font-size: 14px;
}

@media (max-width: 767px) {
	.admin-card, .announcement-card {
		width: 100%;
	}
}
</style>

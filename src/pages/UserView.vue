<script setup lang="ts">
import { getCurrentUser, isLoggedIn, logout, type UserData } from '@/utils/user';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const user = ref<UserData>();
const router = useRouter();

onMounted(async () => {
	if (!await isLoggedIn()) await router.push('/login');
	user.value = await getCurrentUser();
});

function logoutEvent() {
	logout();
	router.push('/login');
}

function levelExp(level: number): number {
    return level ** 3 - (level - 1) ** 3;
}
</script>

<template>
	<div v-if="user">
		<h2>用户</h2>

		<!-- Avatar -->
		<div class="avatar-section">
			<mdui-avatar
				v-if="user.avatar"
				:src="'data:image/png;base64,' + user.avatar"
				style="width: 80px; height: 80px;"
			></mdui-avatar>
			<mdui-avatar
				v-else
				style="width: 80px; height: 80px; font-size: 36px;"
			>{{ user.nickname?.charAt(0) || '?' }}</mdui-avatar>
		</div>

		<table>
			<tbody>
			<tr>
				<td>当前登录:</td>
				<td>{{ user.nickname }} ({{ user.user_id }})</td>
			</tr>
			<tr>
				<td>VimCoin:</td>
				<td>{{ user.vimcoin }}</td>
			</tr>
			<tr>
				<td>等级:</td>
				<td>{{ user.level }} ({{ user.experience }} / {{ levelExp(user.level) }})</td>
			</tr>
			<tr>
				<td>好感度</td>
				<td>{{ user.favorability }}</td>
			</tr>
			<tr>
				<td>血量</td>
				<td>{{ user.health }} / 100</td>
			</tr>
			<tr v-if="user.register_time">
				<td>注册时间:</td>
				<td>{{ new Date(user.register_time * 1000).toLocaleString() }}</td>
			</tr>
			</tbody>
		</table>
		<p></p>
		<mdui-button icon="manage_accounts" end-icon="arrow_forward" @click="router.push('/settings#user')">
			用户账户设置
		</mdui-button>
		&nbsp;
		<mdui-button icon="logout" end-icon="arrow_forward" @click="logoutEvent">退出登录</mdui-button>
	</div>
	<div v-else class="state-box">
		<mdui-linear-progress indeterminate></mdui-linear-progress>
		<p>加载中...</p>
	</div>
</template>

<style scoped lang="scss">
.avatar-section {
    margin-bottom: 16px;
}

table {
	width: 65%;
	border-collapse: collapse;
}

@media (max-width: 768px) {
	table {
		width: 100%;
	}
}

th, td {
	padding: 12px;
	border: 1px solid #dddddd;
	text-align: left;
}

caption {
	caption-side: top;
	font-size: 1.5em;
	padding: 10px;
}

.state-box {
    text-align: center;
    padding: 40px 20px;
}
</style>

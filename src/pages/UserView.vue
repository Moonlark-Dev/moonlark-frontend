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
</script>

<template>
	<div v-if="user">
		<h2>用户</h2>
		<table>
			<tbody>
			<tr>
				<td>当前登录:</td>
				<td>{{ user!!.nickname }} ({{ user!!.user_id }})</td>
			</tr>
			<tr>
				<td>VimCoin:</td>
				<td>{{ user!!.vimcoin }}</td>
			</tr>
			<tr>
				<td>等级:</td>
				<td>{{ user!!.level }} ({{ user!!.experience - (user!!.level - 1) ** 3 }} /
					{{ user!!.level ** 3 - (user!!.level - 1) ** 3 }})
				</td>
			</tr>
			<tr>
				<td>好感度</td>
				<td>{{ user!!.favorability }}</td>
			</tr>
			<tr>
				<td>血量</td>
				<td>{{ user!!.health }} / 100</td>
			</tr>
			</tbody>
		</table>
		<div v-if="user?.register_time">
			<h3>探险家协会登记信息</h3>
			<table>
				<tbody>
				<tr>
					<td>舰船代号:</td>
					<td>{{ user!!.ship_code }}</td>
				</tr>
				<tr>
					<td>激活时间:</td>
					<td>{{ (new Date(user!!.activation_time * 1000)).toString() }}</td>
				</tr>
				<tr>
					<td>登记时间:</td>
					<td>{{ (new Date(user!!.register_time * 1000)).toString() }}</td>
				</tr>
				</tbody>
			</table>
		</div>
		<p></p>
		<mdui-button icon="manage_accounts" end-icon="arrow_forward" @click="router.push('/settings#user')">
			用户账户设置
		</mdui-button>
		&nbsp;
		<mdui-button icon="logout" end-icon="arrow_forward" @click="logoutEvent">退出登录</mdui-button>
	</div>
	<h1 v-else>加载中</h1>
</template>

<style scoped lang="scss">
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
</style>

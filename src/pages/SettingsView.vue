<script setup lang="ts">

import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import BindMainAccountComponent from '@/components/BindMainAccountComponent.vue';
import { getCurrentUser, isLoggedIn, type UserData } from '@/utils/user';
import { isSuperuser } from '@/utils/menupanel';
import ChangeNickName from '@/components/ChangeNickName.vue';

const user = ref<UserData>();
const router = useRouter();
const superuser = ref(false);
onMounted(async () => {
	if (!await isLoggedIn()) await router.push('/login');
	user.value = await getCurrentUser();
	superuser.value = await isSuperuser();
});

</script>

<template>
	<div v-if="user">
		<h1 id="user">用户账户设置</h1>
		<p>当前登录: {{ user?.nickname }}</p>
		<mdui-card variant="outlined" class="card">
			<change-nick-name :user="user" />
		</mdui-card>
		<p></p>
		<mdui-card variant="outlined" class="card">
			<bind-main-account-component :user="user" />
		</mdui-card>
		<p></p>
		<mdui-card v-if="superuser" variant="outlined" class="card">
			<h2>超级管理员</h2>
			<mdui-button icon="admin_panel_settings" end-icon="arrow_forward"
						 @click="router.push('/admin/menupanel')">QQ 菜单/指令面板管理
			</mdui-button>
		</mdui-card>
	</div>
	<p v-else>正在加载……</p>
</template>

<style scoped lang="scss">


.card {
	padding: 20px;
	width: 67%;
}

@media (max-width: 767px) {
	.card {
		width: 100%;
	}
}

</style>

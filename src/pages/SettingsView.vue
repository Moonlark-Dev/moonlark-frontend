<script setup lang="ts">
import { getPrefix } from '@/utils/prefix';
import { getCurrentUser, isLoggedIn, logout, requestBindMainAccount, type UserData } from '@/utils/user';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const user = ref<UserData>();
const mainAccountID = ref("");
const binaActivateCode = ref("");

onMounted(async () => {
	if (!await isLoggedIn()) await router.push('/login');
	user.value = await getCurrentUser();
});

async function bindMainAccount() {
	const code = await requestBindMainAccount(mainAccountID.value);
	if (code === undefined) {
		alert("激活码获取失败，请稍后重试。");
		mainAccountID.value = "";
	} else {
		binaActivateCode.value = `${ await getPrefix() }account bind ${ code }`;
	}
}

function logoutEvent() {
	logout();
	router.push('/login');
}

</script>

<template>
	<div v-if="user">
		<h2 id="user">用户账户设置</h2>
		<p>当前登录: {{ user?.nickname }}</p>
		<h3>绑定母帐号</h3>
		<div class="form" v-if="!binaActivateCode">
			<mdui-text-field label="帐号ID" :value="mainAccountID" @input="mainAccountID = $event.target.value" clearable></mdui-text-field>
			<p></p>
			<mdui-button @click="bindMainAccount()">绑定</mdui-button>
		</div>
		<div class="form" v-else>
			<p>请使用 {{ mainAccountID }} 输入以下指令进行激活: </p>
			<mdui-text-field :value="binaActivateCode" readonly></mdui-text-field>
			<a :href="void logoutEvent()">我已完成绑定，退出登录</a>
		</div>
	</div>
	<h1 v-else>加载中</h1>
</template>

<style scoped lang="scss">
.form {
	width: 50%;
}
</style>

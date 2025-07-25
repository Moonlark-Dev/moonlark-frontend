<script setup lang="ts">
import { getPrefix } from '@/utils/prefix';
import { logout, requestBindMainAccount, type UserData } from '@/utils/user';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps(['user'])
const router = useRouter();
const user = ref<UserData>(props.user);
const mainAccountID = ref("");
const bindActivateCode = ref("");


async function bindMainAccount() {
	const code = await requestBindMainAccount(mainAccountID.value);
	if (code === undefined) {
		alert("激活码获取失败，请稍后重试。");
		mainAccountID.value = "";
	} else {
		bindActivateCode.value = `${ await getPrefix() }account bind ${ code }`;
	}
}

function logoutEvent() {
	logout();
	router.push('/login');
}

</script>

<template>
	<h2>绑定母帐号</h2>
	<div class="form" v-if="!bindActivateCode">
		<mdui-text-field label="帐号ID" :value="mainAccountID" @input="mainAccountID = $event.target.value" clearable></mdui-text-field>
		<p>绑定后此账号的所有事件都会被认为是母账号发出的，暂不支持解绑。</p>
		<mdui-button @click="bindMainAccount()">绑定</mdui-button>
	</div>
	<div v-else>
		<p>请使用 {{ mainAccountID }} 输入以下指令进行激活: </p>
		<mdui-text-field :value="bindActivateCode" readonly></mdui-text-field>
		<a :href="void logoutEvent()">我已完成绑定，退出登录</a>
	</div>
</template>

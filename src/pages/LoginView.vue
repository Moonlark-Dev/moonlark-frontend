<script setup lang="ts">
import { getPrefix } from '@/utils/prefix';
import { isLoggedIn, login } from '@/utils/user';
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from "vue-router";

const props = defineProps({ isMobile: Boolean });
const step = ref(0);
const activateCode = ref("获取中 ...");
const userID = ref<string | null>(null);
const verifyInterval = ref(0);
const router = useRouter();
let intervalId: number[] = [];

async function checkLogin() {
	if (await isLoggedIn()) router.back();
}

function changeTimer() {
	verifyInterval.value -= 1;
}

async function getActivateCode() {
	let data = await login(userID.value!!);
	activateCode.value = `${ await getPrefix() }account verify ${ data.activate_code }`;
	step.value = 1;
	verifyInterval.value = data.effective_time;
	intervalId.push(setInterval(checkLogin, 1000));
	intervalId.push(setInterval(changeTimer, 1000));
}

onMounted(
	async () => {
		if (await isLoggedIn()) await router.push("/");
	}
);

onUnmounted(() => {
	intervalId.forEach(value => {
		clearInterval(value);
	});
});
</script>

<template>
	<h1>登录</h1>
	<div v-if="step === 0" :class="{ form: !props.isMobile }">
		<mdui-text-field label="用户ID" :value="userID" @input="userID = $event.target.value" clearable></mdui-text-field>
		<p></p>
		<mdui-button @click="getActivateCode()">确认</mdui-button>
	</div>
	<div v-if="step === 1" :class="{ form: !props.isMobile }">
		<p>请在 Moonlark 中输入以下指令进行激活: </p>
		<mdui-text-field :value="activateCode" readonly></mdui-text-field>
		<small>请在 <strong>{{ verifyInterval }}s</strong> 内完成登录验证</small>
	</div>
</template>

<style scoped lang="scss">
.form {
	width: 50%;
}
</style>

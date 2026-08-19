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
const loginError = ref("");

function clearIntervals() {
    intervalId.forEach(id => clearInterval(id));
    intervalId = [];
}

async function checkLogin() {
    if (await isLoggedIn()) {
        clearIntervals();
        router.back();
    }
}

function changeTimer() {
    verifyInterval.value -= 1;
    if (verifyInterval.value <= 0) {
        clearIntervals();
        step.value = 2; // timeout
    }
}

async function getActivateCode() {
    if (!userID.value?.trim()) {
        loginError.value = "请输入用户ID";
        return;
    }
    loginError.value = "";
    try {
        const data = await login(userID.value);
        activateCode.value = `${await getPrefix()}account verify ${data.activate_code}`;
        step.value = 1;
        verifyInterval.value = data.effective_time;
        intervalId.push(setInterval(checkLogin, 1000));
        intervalId.push(setInterval(changeTimer, 1000));
    } catch {
        loginError.value = "登录失败，请检查用户ID是否正确";
    }
}

function goBack() {
    clearIntervals();
    step.value = 0;
}

function retryLogin() {
    step.value = 0;
}

onMounted(async () => {
    if (await isLoggedIn()) await router.push("/");
});

onUnmounted(() => {
    clearIntervals();
});
</script>

<template>
    <h1>登录</h1>

    <!-- Step 0: Enter user ID -->
    <div v-if="step === 0" :class="{ form: !props.isMobile }">
        <mdui-text-field label="用户ID" :value="userID" @input="userID = ($event.target as HTMLInputElement).value"
            clearable :error="!!loginError" :helper-text="loginError"></mdui-text-field>
        <p></p>
        <mdui-button @click="getActivateCode()">确认</mdui-button>
        &nbsp;
        <mdui-button @click="router.push('/')" variant="text">返回首页</mdui-button>
    </div>

    <!-- Step 1: Verify -->
    <div v-else-if="step === 1" :class="{ form: !props.isMobile }">
        <p>请在 Moonlark 中输入以下指令进行激活:</p>
        <mdui-text-field :value="activateCode" readonly></mdui-text-field>
        <small>请在 <strong>{{ verifyInterval }}s</strong> 内完成登录验证</small>
        <p></p>
        <mdui-button @click="goBack" variant="text">重新输入</mdui-button>
    </div>

    <!-- Step 2: Timeout -->
    <div v-else-if="step === 2" :class="{ form: !props.isMobile }" class="state-box">
        <mdui-icon name="timer_off" style="font-size: 48px; color: #f44336;"></mdui-icon>
        <p>验证超时，请重新登录</p>
        <mdui-button @click="retryLogin">重新登录</mdui-button>
    </div>
</template>

<style scoped lang="scss">
.form {
    width: 50%;
}

.state-box {
    text-align: center;
    padding: 40px 20px;

    p {
        margin: 16px 0;
    }
}

@media (max-width: 768px) {
    .form {
        width: 100%;
    }
}
</style>

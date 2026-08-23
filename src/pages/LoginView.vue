<script setup lang="ts">
import { isLoggedIn, login, waitForActivation, getSessionIDOrNull, type LoginResult } from '@/utils/user';
import { setCookie } from '@/utils/cookie';
import { getPrefix } from '@/utils/prefix';
import { getLastLoginUser, setLastLoginUser } from '@/utils/lastLoginUser';
import { onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from "vue-router";

const props = defineProps({ isMobile: Boolean });
const step = ref(0);
const activateCode = ref("");
const userID = ref<string | null>(getLastLoginUser() || null);
const rememberMe = ref(false);
const verifyInterval = ref(0);
const router = useRouter();
const route = useRoute();
const loginError = ref("");
let abortController: AbortController | null = null;
let tickId: number | undefined;

function stopWaiting() {
    abortController?.abort();
    abortController = null;
    if (tickId !== undefined) {
        clearInterval(tickId);
        tickId = undefined;
    }
}

function redirectTarget(): string {
    const redirect = route.query.redirect;
    return typeof redirect === "string" && redirect.startsWith("/") ? redirect : "/";
}

function updateCountdown(deadline: number) {
    verifyInterval.value = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
}

async function navigateAfterLogin() {
    const target = redirectTarget();
    if (route.path === target) return;
    await router.push(target);
}

async function getActivateCode() {
    if (!userID.value?.trim()) {
        loginError.value = "请输入用户ID";
        return;
    }
    loginError.value = "";
    const trimmedUserID = userID.value.trim();
    let data: LoginResult;
    try {
        data = await login(trimmedUserID, rememberMe.value ? 30 : undefined);
    } catch {
        loginError.value = "登录失败，请检查用户ID是否正确";
        return;
    }
    // 登录请求成功后记住该用户 ID，下一次进入登录页时预填充
    setLastLoginUser(trimmedUserID);
    // prefix 只用于展示文案：请求失败时 getPrefix 会回退缓存/空串，不影响已成功的登录
    activateCode.value = `${data.command_prefix ?? (await getPrefix())}account verify ${data.activate_code}`;
    step.value = 1;
    const deadline = Date.now() + Math.max(1, data.effective_time || 300) * 1000;
    updateCountdown(deadline);
    tickId = window.setInterval(() => updateCountdown(deadline), 1000);
    abortController = new AbortController();
    try {
        const result = await waitForActivation(abortController.signal, deadline);
        stopWaiting();
        if (result.status === "activated") {
            // 激活时后端会轮换会话 ID（防 fixation），采用服务端下发的最新凭据
            if (result.sessionId && result.sessionId !== getSessionIDOrNull()) {
                setCookie("sessionID", result.sessionId);
            }
            await navigateAfterLogin();
        } else {
            step.value = 2; // timeout
        }
    } catch {
        // 请求被取消（重新输入 / 离开页面），无需处理
    }
}

function goBack() {
    stopWaiting();
    step.value = 0;
}

function retryLogin() {
    stopWaiting();
    step.value = 0;
}

onMounted(async () => {
    if (await isLoggedIn()) await router.push(redirectTarget());
});

onUnmounted(() => {
    stopWaiting();
});
</script>

<template>
    <h1>登录</h1>

    <!-- Step 0: Enter user ID -->
    <div v-if="step === 0" :class="{ form: !props.isMobile }">
        <mdui-text-field label="用户ID" :value="userID" @input="userID = ($event.target as HTMLInputElement).value"
            clearable :error="!!loginError" :helper-text="loginError"></mdui-text-field>
        <p></p>
        <mdui-checkbox :checked="rememberMe"
            @change="rememberMe = ($event.target as HTMLInputElement).checked">30 天内免重新验证（记住此浏览器）</mdui-checkbox>
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

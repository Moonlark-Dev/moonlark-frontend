<script setup lang="ts">

import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import BindMainAccountComponent from '@/components/BindMainAccountComponent.vue';
import { getCurrentUser, isLoggedIn, type UserData } from '@/utils/user';
import ChangeNickName from '@/components/ChangeNickName.vue';
import { setStoredBaseUrl, resetStoredBaseUrl, getStoredBaseUrl } from '@/utils/utils';
import { setAdminPassword, clearAdminPassword, getAdminPassword, hasAdminConfig } from '@/utils/admin';

const user = ref<UserData>();
const router = useRouter();

const backendUrl = ref('');
const adminPassword = ref('');

const savedMessage = ref('');
const passwordMessage = ref('');

onMounted(async () => {
    if (!await isLoggedIn()) await router.push('/login');
    user.value = await getCurrentUser();
    backendUrl.value = getStoredBaseUrl();
    adminPassword.value = getAdminPassword() || '';
});

function saveBackendUrl() {
    const url = backendUrl.value.trim();
    if (!url) {
        resetStoredBaseUrl();
        savedMessage.value = '已重置为默认地址';
    } else {
        setStoredBaseUrl(url);
        savedMessage.value = '后端地址已保存，刷新页面后生效';
    }
    setTimeout(() => { savedMessage.value = ''; }, 3000);
}

function resetBackendUrl() {
    backendUrl.value = '';
    resetStoredBaseUrl();
    savedMessage.value = '已重置为默认地址，刷新页面后生效';
    setTimeout(() => { savedMessage.value = ''; }, 3000);
}

function saveAdminPassword() {
    const pw = adminPassword.value.trim();
    if (!pw) {
        clearAdminPassword();
        passwordMessage.value = '已清除管理员密码';
    } else {
        setAdminPassword(pw);
        passwordMessage.value = '管理员密码已保存';
    }
    setTimeout(() => { passwordMessage.value = ''; }, 3000);
}

function clearAdminPasswordSetting() {
    adminPassword.value = '';
    clearAdminPassword();
    passwordMessage.value = '已清除管理员密码';
    setTimeout(() => { passwordMessage.value = ''; }, 3000);
}

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

        <h1 id="admin">管理员设置</h1>

        <mdui-card variant="outlined" class="card">
            <h2>后端地址</h2>
            <p>Moonlark API 服务器地址，默认 https://moonlark-api.itcdt.top</p>
            <mdui-text-field label="后端地址" :value="backendUrl" @input="backendUrl = ($event.target as HTMLInputElement).value"
                clearable placeholder="https://moonlark-api.itcdt.top"></mdui-text-field>
            <div class="button-row">
                <mdui-button @click="saveBackendUrl()">保存</mdui-button>
                <mdui-button @click="resetBackendUrl()" variant="text">重置为默认</mdui-button>
            </div>
            <small v-if="savedMessage" class="success-message">{{ savedMessage }}</small>
        </mdui-card>
        <p></p>
        <mdui-card variant="outlined" class="card">
            <h2>管理员密码</h2>
            <p>用于访问监控面板，密码仅保存于浏览器本地</p>
            <mdui-text-field label="管理员密码" :value="adminPassword"
                @input="adminPassword = ($event.target as HTMLInputElement).value"
                type="password" clearable></mdui-text-field>
            <div class="button-row">
                <mdui-button @click="saveAdminPassword()">保存</mdui-button>
                <mdui-button v-if="hasAdminConfig()" @click="clearAdminPasswordSetting()" variant="text">清除密码</mdui-button>
            </div>
            <small v-if="passwordMessage" class="success-message">{{ passwordMessage }}</small>
        </mdui-card>
    </div>
    <p v-else>正在加载……</p>
</template>

<style scoped lang="scss">


.card {
    padding: 20px;
    width: 67%;
}

.button-row {
    margin-top: 12px;
    display: flex;
    gap: 8px;
}

.success-message {
    display: block;
    margin-top: 8px;
    color: #4caf50;
}

@media (max-width: 767px) {
    .card {
        width: 100%;
    }
}

</style>

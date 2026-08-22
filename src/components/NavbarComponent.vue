<script setup lang="ts">
import { setTheme } from 'mdui/functions/setTheme';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Theme } from "mdui/internal/theme";
import { getCurrentUser, isLoggedIn, type UserData } from "@/utils/user";
import { useDark } from "@vueuse/core";

const user = ref<UserData>();
const router = useRouter();
const route = useRoute();
const darkMode = useDark();
const props = defineProps({ isMobile: Boolean });

// 根据当前路由计算 active 值
const activeValue = computed(() => {
    const name = String(route.name || 'home');
    return name === '' ? 'home' : name;
});

onMounted(async () => {
    user.value = await isLoggedIn() ? await getCurrentUser() : undefined;
});

function changeTheme(dark: boolean) {
    darkMode.value = dark;
    const theme: Theme = dark ? "dark" : "light";
    setTheme(theme);
}

onMounted(() => {
    changeTheme(darkMode.value);
});

function navigateTo(page: string) {
    const path = page === 'home' ? '/' : `/${page}`;
    router.push(path);
}

</script>

<template>
    <mdui-navigation-rail v-if="!props.isMobile" :value="activeValue" divider>
        <mdui-button-icon slot="top">
            <mdui-avatar src="https://moonlark-wiki.itcdt.top//images/f/f8/Moonlark.png"></mdui-avatar>
        </mdui-button-icon>
        <mdui-fab size="small" icon="people--outlined" value="user" @click="navigateTo('user')" slot="top"></mdui-fab>
        <mdui-navigation-rail-item icon="home--outlined" value="home" @click="navigateTo('home')">主页
        </mdui-navigation-rail-item>
        <mdui-navigation-rail-item icon="list--outlined" value="rankings" @click="navigateTo('rankings')">排行
        </mdui-navigation-rail-item>
        <mdui-navigation-rail-item icon="menu_book--outlined" value="help" @click="navigateTo('help')">帮助
        </mdui-navigation-rail-item>
        <mdui-button-icon v-if="user" icon="settings--outlined" @click="navigateTo('settings')" slot="bottom"></mdui-button-icon>
        <mdui-button-icon icon="source--outlined" slot="bottom" href="https://github.com/Moonlark-Dev/Moonlark" target="_blank"></mdui-button-icon>
        <mdui-button-icon @click="changeTheme(false)" v-if="darkMode" icon="dark_mode--outlined" slot="bottom"></mdui-button-icon>
        <mdui-button-icon @click="changeTheme(true)" v-else icon="light_mode--outlined" slot="bottom"></mdui-button-icon>
    </mdui-navigation-rail>
    <mdui-navigation-bar v-else :value="activeValue" scroll-behavior="hide">
        <mdui-navigation-bar-item icon="home--outlined" value="home" @click="navigateTo('home')">主页
        </mdui-navigation-bar-item>
        <mdui-navigation-bar-item icon="people--outlined" value="user" @click="navigateTo('user')">用户
        </mdui-navigation-bar-item>
        <mdui-navigation-bar-item icon="list--outlined" value="rankings" @click="navigateTo('rankings')">排行
        </mdui-navigation-bar-item>
        <mdui-navigation-bar-item icon="menu_book--outlined" value="help" @click="navigateTo('help')">帮助
        </mdui-navigation-bar-item>
    </mdui-navigation-bar>
</template>

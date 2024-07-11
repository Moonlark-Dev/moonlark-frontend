<script setup>
import { setTheme } from 'mdui/functions/setTheme.js';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const darkMode = ref(true);
const activatedItem = ref("home");
const props = defineProps({ isMobile: Boolean });
const router = useRouter();


function changeTheme(dark) {
    darkMode.value = dark;
    setTheme(dark ? "dark" : "light");
}


function changePage(page) {
    activatedItem.value = page;
    router.push(`/${page}`);
}


</script>

<template>
    <mdui-navigation-rail v-if="!props.isMobile" :value="activatedItem" divider>
        <mdui-button-icon slot="top">
            <mdui-avatar src="https://moonlark-wiki.itcdt.top/w/images/f/f8/Moonlark.png"></mdui-avatar>
        </mdui-button-icon>
        <mdui-fab lowered icon="people--outlined" value="user" @click="changePage('user')" slot="top"></mdui-fab>

        <mdui-navigation-rail-item icon="home--outlined" value="home"
            @click="changePage('')">主页</mdui-navigation-rail-item>
        <mdui-navigation-rail-item icon="list--outlined" value="rankings"
            @click="changePage('rankings')">排行</mdui-navigation-rail-item>

        <mdui-button-icon icon="settings--outlined" @click="changePage('settings')" slot="bottom"></mdui-button-icon>
        <mdui-button-icon icon="source--outlined" slot="bottom" href="https://github.com/Moonlark-Dev/Moonlark"
            target="_blank"></mdui-button-icon>
        <mdui-button-icon @click="changeTheme(false)" v-if="darkMode" icon="dark_mode--outlined"
            slot="bottom"></mdui-button-icon>
        <mdui-button-icon @click="changeTheme(true)" v-else icon="light_mode--outlined"
            slot="bottom"></mdui-button-icon>
    </mdui-navigation-rail>

    <mdui-navigation-bar v-else :value="activatedItem" scroll-behavior="hide">
        <mdui-navigation-bar-item icon="home--outlined" value="home"
            @click="changePage('')">主页</mdui-navigation-bar-item>
        <mdui-navigation-bar-item icon="people--outlined" value="user"
            @click="changePage('user')">用户</mdui-navigation-bar-item>
        <mdui-navigation-bar-item icon="list--outlined" value="rankings"
            @click="changePage('rankings')">排行</mdui-navigation-bar-item>
    </mdui-navigation-bar>
</template>
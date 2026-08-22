<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getCurrentUser, isLoggedIn } from '@/utils/user';

const nickname = ref("用户");

onMounted(async () => {
    if (!await isLoggedIn()) {
        nickname.value = "未登录用户";
        return;
    }
    try {
        const user = await getCurrentUser();
        if (user) nickname.value = user.nickname || "未登录用户";
    } catch {
        nickname.value = "未登录用户";
    }
});
</script>

<template>
	<h1>主页</h1>
	<p>欢迎回来，{{ nickname }}！</p>
</template>

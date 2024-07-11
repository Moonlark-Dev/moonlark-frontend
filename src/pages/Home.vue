<script setup>
import { onMounted, ref } from 'vue';
import { getCurrentUser } from '@/utils/user.js';

const nickname = ref("未登陆用户");

onMounted(async () => {
    let user = await getCurrentUser()
    if (user) {
        nickname.value = user.nickname || "未登陆用户";
    }
})

</script>

<template>
    <h1>主页</h1>
    <p>欢迎回来，{{ nickname }}！</p>
</template>

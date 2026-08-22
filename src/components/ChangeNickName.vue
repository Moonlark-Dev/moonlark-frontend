<script setup lang="ts">
import { postChangeNickname, type UserData } from '@/utils/user';
import { ref } from 'vue';
import { showToast } from '@/components/ToastComponent.vue';

const props = defineProps(['user']);
const user = ref<UserData>(props.user);
const newNickname = ref(user.value.nickname);

async function changeNickname() {
    const result = await postChangeNickname(newNickname.value);
    if (result.success) {
        showToast("昵称修改成功", "success");
        setTimeout(() => location.reload(), 800);
    } else {
        showToast(result.message || "修改失败", "error");
    }
}
</script>

<template>
    <div v-if="user">
        <h2>修改昵称</h2>

        <mdui-text-field label="新的昵称" :value="newNickname" @input="newNickname = ($event.target as HTMLInputElement).value" clearable></mdui-text-field>
        <p>更改后昵称将不再随 IM 中的昵称更改，解除锁定请留空。</p>
        <mdui-button @click="changeNickname()">修改</mdui-button>
    </div>
    <h1 v-else>加载中</h1>
</template>

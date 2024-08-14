<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import Navigation from './components/NavbarComponent.vue';
import { RouterView } from 'vue-router';

const isMobile = ref(false);

function updateWindowWidth() {
    isMobile.value = window.innerWidth < 768;
}

onMounted(() => {
    window.addEventListener('resize', updateWindowWidth);
    updateWindowWidth();
});
onUnmounted(() => {
    window.removeEventListener('resize', updateWindowWidth);
});
</script>

<template>
    <Navigation :isMobile="isMobile"/>
    <main class="container">
        <RouterView />
    </main>
</template>

<style scoped>
.container {
    width: 100%;
    max-width: 1200px;
    padding: 20px;
    box-sizing: border-box;
}
</style>

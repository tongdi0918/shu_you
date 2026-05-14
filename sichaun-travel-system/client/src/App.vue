<!-- client/src/App.vue -->
<template>
  <div id="app">
    <!-- 管理端页面不显示通用头部 -->
    <AppHeader v-if="!isAdminRoute" />
    <router-view />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AppHeader from './components/common/AppHeader.vue';

const route = useRoute();
const isAdminRoute = computed(() => route.path.startsWith('/admin'));
</script>

<style>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
body {
    font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
    background: #f5f7fa;
    color: #2c3e50;
    -webkit-font-smoothing: antialiased;
}
#app {
    min-height: 100vh;
}
a {
    text-decoration: none;
    color: inherit;
}
</style>
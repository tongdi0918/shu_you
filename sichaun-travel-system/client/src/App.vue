<template>
  <div id="app">
    <!--
      导航栏：首页已有自己的导航条，所以首页不显示通用导航栏
      管理端页面 (/admin*) 使用管理端自己的布局，也不显示
    -->
    <NavBar v-if="showNavBar" />
    <router-view />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from '@/components/NavBar.vue'

const route = useRoute()

// 首页和管理端页面不显示通用导航栏
const showNavBar = computed(() => {
  const path = route.path
  // 首页（/）不显示
  if (path === '/') return false
  // 管理端页面不显示
  if (path.startsWith('/admin')) return false
  // 登录和注册页面显示导航栏（这样用户可以随时返回首页）
  return true
})
</script>

<style>
#app {
  min-height: 100vh;
  background: #f5f7fa;
}
</style>
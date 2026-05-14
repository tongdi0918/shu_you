<!-- client/src/components/common/AppHeader.vue -->
<template>
  <header class="app-header">
    <div class="header-container">
      <div class="logo" @click="$router.push('/')">
        <span class="logo-icon">🏔️</span>
        <span class="logo-text">蜀游记</span>
      </div>

      <nav class="nav-links">
        <router-link to="/" class="nav-item">首页</router-link>
        <router-link to="/recommend" class="nav-item" v-if="userStore.isLoggedIn">
          智能推荐
        </router-link>
        <router-link to="/route-plan" class="nav-item" v-if="userStore.isLoggedIn">
          路线规划
        </router-link>
      </nav>

      <div class="header-right">
        <template v-if="userStore.isLoggedIn">
          <el-dropdown>
            <span class="user-info">
              <el-avatar :size="32" icon="UserFilled" />
              <span class="username">{{ userStore.username }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-if="userStore.isAdmin" @click="$router.push('/admin/dashboard')">
                  管理后台
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <el-button size="small" @click="$router.push('/login')">登录</el-button>
          <el-button size="small" type="primary" @click="$router.push('/register')">注册</el-button>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useUserStore } from '../../stores/userStore';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const userStore = useUserStore();
const router = useRouter();

function handleLogout() {
    userStore.logout();
    ElMessage.success('已退出登录');
    router.push('/');
}
</script>

<style scoped>
.app-header {
    background: #fff;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    position: sticky;
    top: 0;
    z-index: 1000;
}
.header-container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    height: 64px;
}
.logo {
    display: flex;
    align-items: center;
    cursor: pointer;
    gap: 8px;
}
.logo-icon { font-size: 28px; }
.logo-text { font-size: 22px; font-weight: 700; color: #2c3e50; }
.nav-links { display: flex; gap: 24px; }
.nav-item {
    color: #606266;
    text-decoration: none;
    font-size: 15px;
    padding: 4px 0;
    border-bottom: 2px solid transparent;
    transition: all 0.3s;
}
.nav-item:hover, .nav-item.router-link-active {
    color: #f5576c;
    border-bottom-color: #f5576c;
}
.header-right { display: flex; align-items: center; gap: 12px; }
.user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
}
.username { font-size: 14px; color: #2c3e50; }
</style>
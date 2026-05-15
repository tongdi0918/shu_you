<!-- client/src/components/common/AppHeader.vue -->
<template>
  <el-header class="app-header">
    <div class="header-left">
      <router-link to="/" class="logo">🏔️ 蜀游记</router-link>
    </div>
    <div class="header-center">
      <router-link to="/">首页</router-link>
      <router-link to="/recommend">智能推荐</router-link>
      <router-link to="/route-plan">路线规划</router-link>
    </div>
    <div class="header-right">
      <template v-if="userStore.isLoggedIn">
        <el-dropdown>
          <span class="user-info">
            <el-avatar :size="32" icon="UserFilled" />
            {{ userStore.username }}
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="$router.push('/profile')">个人信息</el-dropdown-item>
              <el-dropdown-item @click="$router.push('/favorites')">我的收藏</el-dropdown-item>
              <el-dropdown-item @click="$router.push('/history')">浏览历史</el-dropdown-item>
              <el-dropdown-item v-if="userStore.isAdmin" @click="$router.push('/admin/dashboard')">管理后台</el-dropdown-item>
              <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
      <template v-else>
        <router-link to="/login">登录</router-link>
        <router-link to="/register">注册</router-link>
      </template>
    </div>
  </el-header>
</template>

<script setup>
import { useUserStore } from '../../stores/userStore';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

const handleLogout = () => {
  userStore.logout();
  router.push('/');
};
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0 20px;
  height: 60px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-left .logo {
  font-size: 22px;
  font-weight: bold;
  color: white;
  text-decoration: none;
}

.header-center a {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  margin: 0 16px;
  font-size: 15px;
  transition: color 0.3s;
}

.header-center a:hover,
.header-center a.router-link-active {
  color: #fff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-right a {
  color: white;
  text-decoration: none;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: white;
}
</style>
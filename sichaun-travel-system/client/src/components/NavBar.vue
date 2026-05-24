<template>
  <header class="navbar">
    <div class="navbar-inner">
      <!-- Logo / 品牌 -->
      <router-link to="/" class="navbar-brand">
        <span class="brand-icon">🏔️</span>
        <span class="brand-text">蜀游智行</span>
      </router-link>

      <!-- 导航链接 -->
      <nav class="navbar-links">
        <router-link to="/" class="nav-link">首页</router-link>
        <router-link to="/recommend" class="nav-link">智能推荐</router-link>
        <router-link to="/route-plan" class="nav-link">路线规划</router-link>
      </nav>

      <!-- 右侧操作区 -->
      <div class="navbar-actions">
        <template v-if="isLoggedIn">
          <router-link to="/profile" class="nav-link">
            <el-icon><User /></el-icon>
            <span>{{ username }}</span>
          </router-link>
          <router-link to="/favorites" class="nav-link">我的收藏</router-link>
          <router-link to="/history" class="nav-link">浏览历史</router-link>
          <el-button type="danger" size="small" @click="handleLogout">退出</el-button>
        </template>
        <template v-else>
          <router-link to="/login" class="nav-link">登录</router-link>
          <router-link to="/register">
            <el-button type="primary" size="small">注册</el-button>
          </router-link>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

const isLoggedIn = computed(() => !!localStorage.getItem('token'))
const username = computed(() => {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  return user ? user.username : ''
})

function handleLogout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  padding: 0 20px;
}

.navbar-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}

.navbar-brand {
  display: flex;
  align-items: center;
  text-decoration: none;
  gap: 8px;
}

.brand-icon {
  font-size: 28px;
}

.brand-text {
  font-size: 22px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 2px;
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-link {
  color: #c8d6e5;
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  transition: color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-link:hover {
  color: #ffffff;
}

.nav-link.router-link-exact-active {
  color: #48dbfb;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

@media (max-width: 768px) {
  .navbar-links {
    display: none;
  }
  .navbar-actions .nav-link {
    font-size: 13px;
  }
}
</style>
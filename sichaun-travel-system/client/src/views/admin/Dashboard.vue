<!-- client/src/views/admin/Dashboard.vue（完整升级版） -->
<template>
  <div class="admin-dashboard">
    <div class="dashboard-header">
      <h2>📊 蜀游记管理后台</h2>
      <div class="header-actions">
        <span class="welcome">欢迎，{{ userStore.username }}</span>
        <el-button type="danger" plain size="small" @click="handleLogout">退出登录</el-button>
      </div>
    </div>

    <!-- 统计面板 -->
    <StatsDashboard />

    <!-- 数据管理面板 -->
    <div class="section">
      <DataManager />
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '../../stores/userStore';
import { useRouter } from 'vue-router';
import StatsDashboard from '../../components/admin/StatsDashboard.vue';
import DataManager from '../../components/admin/DataManager.vue';

const userStore = useUserStore();
const router = useRouter();

function handleLogout() {
  userStore.logout();
  router.push('/admin');
}
</script>

<style scoped>
.admin-dashboard {
  padding: 24px;
  background: #f0f2f5;
  min-height: 100vh;
}
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
h2 { margin: 0; color: #1a1a2e; font-size: 22px; }
.header-actions { display: flex; align-items: center; gap: 16px; }
.welcome { font-size: 14px; color: #606266; }
.section { margin-top: 24px; }
</style>
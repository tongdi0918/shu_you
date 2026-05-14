<!-- client/src/views/admin/Dashboard.vue -->
<template>
  <div class="admin-dashboard">
    <div class="admin-header">
      <h2>📊 管理仪表盘</h2>
      <el-button @click="userStore.logout(); $router.push('/admin')">退出</el-button>
    </div>

    <div class="stats-grid">
      <el-card class="stat-card">
        <span class="stat-num">{{ stats.userCount }}</span>
        <span class="stat-label">注册用户</span>
      </el-card>
      <el-card class="stat-card">
        <span class="stat-num">{{ stats.scenicCount }}</span>
        <span class="stat-label">景区数量</span>
      </el-card>
      <el-card class="stat-card">
        <span class="stat-num">{{ stats.foodCount }}</span>
        <span class="stat-label">美食数量</span>
      </el-card>
      <el-card class="stat-card warning">
        <span class="stat-num">{{ stats.highWarningCount }}</span>
        <span class="stat-label">高拥堵预警</span>
      </el-card>
    </div>

    <div class="admin-nav">
      <el-button type="primary" @click="$router.push('/admin/scenic')">🏔️ 景区管理</el-button>
      <el-button type="success" @click="$router.push('/admin/food')">🍜 美食管理</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '../../stores/userStore';
import { getAdminStats } from '../../api/admin';

const userStore = useUserStore();
const stats = ref({
    userCount: 0,
    scenicCount: 0,
    foodCount: 0,
    highWarningCount: 0
});

onMounted(async () => {
    try {
        const res = await getAdminStats();
        stats.value = res.data;
    } catch (e) {
        console.error(e);
    }
});
</script>

<style scoped>
.admin-dashboard {
    padding: 30px;
    background: #f0f2f5;
    min-height: 100vh;
}
.admin-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
}
.admin-header h2 { margin: 0; color: #2c3e50; }
.stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 40px;
}
.stat-card { text-align: center; padding: 20px; }
.stat-num { display: block; font-size: 36px; font-weight: 700; color: #2c3e50; }
.stat-label { font-size: 14px; color: #909399; }
.stat-card.warning .stat-num { color: #f56c6c; }
.admin-nav { display: flex; gap: 20px; justify-content: center; }
</style>
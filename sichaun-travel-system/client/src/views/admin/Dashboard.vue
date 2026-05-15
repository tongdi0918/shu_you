<!-- client/src/views/admin/Dashboard.vue -->
<template>
  <div class="admin-dashboard">
    <el-container>
      <el-header class="admin-header">
        <h2>🏔️ 蜀游记管理后台</h2>
        <div class="header-right">
          <span>欢迎，{{ userStore.username }}</span>
          <el-button type="danger" size="small" @click="handleLogout">退出登录</el-button>
        </div>
      </el-header>
      <el-container>
        <el-aside width="200px" class="admin-aside">
          <el-menu router :default-active="$route.path">
            <el-menu-item index="/admin/dashboard">
              <el-icon><DataAnalysis /></el-icon>
              <span>数据概览</span>
            </el-menu-item>
            <el-menu-item index="/admin/scenic">
              <el-icon><Picture /></el-icon>
              <span>景区管理</span>
            </el-menu-item>
            <el-menu-item index="/admin/food">
              <el-icon><DishDot /></el-icon>
              <span>美食管理</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <el-main>
          <!-- 统计卡片 -->
          <el-row :gutter="20">
            <el-col :span="6">
              <el-card shadow="hover" class="stat-card">
                <el-statistic title="注册用户" :value="stats.userCount">
                  <template #prefix><el-icon><User /></el-icon></template>
                </el-statistic>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover" class="stat-card">
                <el-statistic title="景区数量" :value="stats.scenicCount">
                  <template #prefix><el-icon><Picture /></el-icon></template>
                </el-statistic>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover" class="stat-card">
                <el-statistic title="美食数量" :value="stats.foodCount">
                  <template #prefix><el-icon><DishDot /></el-icon></template>
                </el-statistic>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover" class="stat-card warning">
                <el-statistic title="高拥堵预警" :value="stats.highWarningCount">
                  <template #prefix><el-icon><WarningFilled /></el-icon></template>
                </el-statistic>
              </el-card>
            </el-col>
          </el-row>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../stores/userStore';
import { getAdminStats } from '../../api/admin';
import { ElMessage } from 'element-plus';

const router = useRouter();
const userStore = useUserStore();

const stats = ref({
  userCount: 0,
  scenicCount: 0,
  foodCount: 0,
  highWarningCount: 0,
});

const loadStats = async () => {
  try {
    const res = await getAdminStats();
    stats.value = res.data || res || stats.value;
  } catch (e) {
    ElMessage.error('加载统计数据失败');
  }
};

const handleLogout = () => {
  userStore.logout();
  router.push('/admin');
};

onMounted(loadStats);
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background: #f5f7fa;
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0 20px;
  height: 60px;
}

.admin-header h2 {
  margin: 0;
  font-size: 20px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.admin-aside {
  background: #fff;
  border-right: 1px solid #e4e7ed;
}

.stat-card {
  text-align: center;
  margin-bottom: 20px;
}

.stat-card.warning {
  border-top: 3px solid #e6a23c;
}
</style>
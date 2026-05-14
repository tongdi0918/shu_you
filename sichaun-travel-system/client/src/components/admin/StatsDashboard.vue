<!-- client/src/components/admin/StatsDashboard.vue -->
<template>
  <div class="stats-dashboard">
    <h3>📈 实时数据看板</h3>
    
    <!-- 关键指标卡片 -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-icon" style="background: #e6f7ff"><UserFilled style="color:#1890ff" /></div>
        <div class="kpi-info">
          <span class="kpi-num">{{ stats.userCount }}</span>
          <span class="kpi-label">注册用户</span>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon" style="background: #fff7e6"><StarFilled style="color:#fa8c16" /></div>
        <div class="kpi-info">
          <span class="kpi-num">{{ stats.scenicCount }}</span>
          <span class="kpi-label">景区总数</span>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon" style="background: #f6ffed"><DishDot style="color:#52c41a" /></div>
        <div class="kpi-info">
          <span class="kpi-num">{{ stats.foodCount }}</span>
          <span class="kpi-label">美食条目</span>
        </div>
      </div>
      <div class="kpi-card warning">
        <div class="kpi-icon" style="background: #fff2f0"><WarningFilled style="color:#ff4d4f" /></div>
        <div class="kpi-info">
          <span class="kpi-num">{{ stats.highWarningCount }}</span>
          <span class="kpi-label">高拥堵预警</span>
        </div>
      </div>
    </div>

    <!-- 热门景区排行 -->
    <div class="chart-card" v-if="stats.topSceneries">
      <h4>🔥 热门景区 Top5</h4>
      <div class="top-list">
        <div v-for="(item, index) in stats.topSceneries" :key="index" class="top-item">
          <span class="rank">{{ index + 1 }}</span>
          <span class="name">{{ item.name }}</span>
          <span class="score">⭐ {{ item.rating }}</span>
        </div>
      </div>
    </div>

    <!-- 城市景区分布 -->
    <div class="chart-card" v-if="stats.cityDistribution">
      <h4>🏙️ 景区城市分布</h4>
      <div class="distribution-bars">
        <div v-for="city in stats.cityDistribution" :key="city.city" class="bar-row">
          <span class="bar-label">{{ city.city }}</span>
          <div class="bar-track">
            <div class="bar-fill" :style="{ width: (city.count / maxCityCount * 100) + '%' }"></div>
          </div>
          <span class="bar-num">{{ city.count }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getAdminStats } from '../../api/admin';
import { UserFilled, StarFilled, DishDot, WarningFilled } from '@element-plus/icons-vue';

const stats = ref({
  userCount: 0,
  scenicCount: 0,
  foodCount: 0,
  highWarningCount: 0,
  topSceneries: [],
  cityDistribution: []
});

const maxCityCount = computed(() => {
  if (!stats.value.cityDistribution?.length) return 1;
  return Math.max(...stats.value.cityDistribution.map(c => c.count));
});

onMounted(async () => {
  try {
    const res = await getAdminStats();
    stats.value = res.data;
  } catch (e) {
    console.error('加载统计数据失败', e);
  }
});
</script>

<style scoped>
.stats-dashboard { padding: 20px; background: #fff; border-radius: 12px; }
h3 { margin: 0 0 24px; color: #1a1a2e; }
.kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
.kpi-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.kpi-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
.kpi-info { display: flex; flex-direction: column; }
.kpi-num { font-size: 28px; font-weight: 700; color: #1a1a2e; line-height: 1; }
.kpi-label { font-size: 13px; color: #909399; margin-top: 4px; }
.kpi-card.warning .kpi-num { color: #ff4d4f; }
.chart-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  margin-bottom: 20px;
}
h4 { margin: 0 0 16px; color: #303133; }
.top-item { display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
.rank { width: 24px; height: 24px; background: #f5f5f5; border-radius: 50%; text-align: center; line-height: 24px; font-size: 13px; margin-right: 12px; }
.name { flex: 1; font-size: 14px; }
.score { color: #e6a23c; font-size: 13px; }
.distribution-bars { margin-top: 12px; }
.bar-row { display: flex; align-items: center; margin-bottom: 12px; }
.bar-label { width: 80px; font-size: 13px; }
.bar-track { flex: 1; height: 8px; background: #f0f0f0; border-radius: 4px; margin: 0 12px; overflow: hidden; }
.bar-fill { height: 100%; background: linear-gradient(90deg, #f5576c, #f093fb); border-radius: 4px; transition: width 0.6s; }
.bar-num { width: 40px; text-align: right; font-size: 13px; font-weight: 600; }
</style>
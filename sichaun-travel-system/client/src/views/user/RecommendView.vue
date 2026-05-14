<!-- client/src/views/user/RecommendView.vue -->
<template>
  <div class="page-container">
    <div class="page-header">
      <h2>🎯 为您量身定制的四川旅行推荐</h2>
      <p>基于协同过滤算法，根据您的历史浏览与偏好智能推荐</p>
    </div>

    <RecommendPanel
      :sceneries="travelStore.recommendScenery"
      :foods="travelStore.recommendFood"
      @refresh="loadData"
    />

    <div class="action-section">
      <el-button type="primary" size="large" @click="$router.push('/route-plan')">
        🚗 根据推荐生成路线
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useTravelStore } from '../../stores/travelStore';
import RecommendPanel from '../../components/recommend/RecommendPanel.vue';

const travelStore = useTravelStore();

async function loadData() {
    await travelStore.loadRecommend();
}

onMounted(loadData);
</script>

<style scoped>
.page-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 30px 20px;
}
.page-header {
    text-align: center;
    margin-bottom: 30px;
}
.page-header h2 { margin: 0 0 8px; font-size: 26px; color: #2c3e50; }
.page-header p { color: #909399; margin: 0; }
.action-section {
    text-align: center;
    margin-top: 30px;
}
</style>
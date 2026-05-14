<!-- client/src/components/recommend/RecommendPanel.vue -->
<template>
  <div class="recommend-panel">
    <div class="panel-header">
      <h3>🎯 为您推荐</h3>
      <el-button size="small" type="primary" text @click="$emit('refresh')">
        换一批
      </el-button>
    </div>

    <el-empty v-if="!sceneries.length && !foods.length" description="登录后获取个性化推荐" />

    <div v-if="sceneries.length > 0" class="section">
      <h4 class="section-subtitle">🏔️ 推荐景区</h4>
      <div class="recommend-grid">
        <ScenicCard v-for="item in sceneries.slice(0, 4)" :key="item.id" :scenic="item" />
      </div>
    </div>

    <div v-if="foods.length > 0" class="section">
      <h4 class="section-subtitle">🍜 推荐美食</h4>
      <div class="recommend-grid">
        <FoodCard v-for="item in foods.slice(0, 4)" :key="item.id" :food="item" />
      </div>
    </div>
  </div>
</template>

<script setup>
import ScenicCard from '../scenic/ScenicCard.vue';
import FoodCard from '../food/FoodCard.vue';

defineProps({
    sceneries: { type: Array, default: () => [] },
    foods: { type: Array, default: () => [] }
});
defineEmits(['refresh']);
</script>

<style scoped>
.recommend-panel {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}
.panel-header h3 { margin: 0; font-size: 18px; color: #2c3e50; }
.section { margin-bottom: 20px; }
.section:last-child { margin-bottom: 0; }
.section-subtitle {
    font-size: 15px;
    color: #606266;
    margin: 0 0 12px;
    padding-left: 8px;
    border-left: 3px solid #f5576c;
}
.recommend-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
}
</style>
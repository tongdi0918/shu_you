<!-- 
client/src/components/food/FoodList.vue 
-->
<template>
  <div class="food-list">
    <!-- 美食卡片组顶部的刷新按钮（新增） -->
    <div class="list-header">
      <el-button type="primary" size="small" @click="refresh" :loading="loading">
        🔄 刷新美食
      </el-button>
    </div>
    <el-row :gutter="20">
      <el-col v-for="item in foods" :key="item.id" :xs="24" :sm="12" :md="8" :lg="6">
        <FoodCard :food="item" />
      </el-col>
    </el-row>
    <div v-if="loading" style="text-align: center; padding: 40px;">
      <el-icon class="is-loading" :size="32"><Loading /></el-icon>
    </div>
    <el-empty v-if="!loading && foods.length === 0" description="暂无美食数据" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getFoods } from '../../api/food';
import FoodCard from './FoodCard.vue';

const foods = ref([]);
const loading = ref(false);

const loadData = async () => {
  loading.value = true;
  try {
    const res = await getFoods();
    foods.value = res.data || [];
  } catch (e) {
    console.error('加载美食失败', e);
  } finally {
    loading.value = false;
  }
};

// ★ 新增：暴露 refresh 方法
const refresh = () => {
  loadData();
};

onMounted(loadData);

// ★ 新增：将 refresh 暴露给父组件
defineExpose({ refresh });
</script>

<style scoped>
/* ★ 新增：列表头部样式 */
.list-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}
</style>
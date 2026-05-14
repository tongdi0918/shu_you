<!-- client/src/components/scenic/ScenicList.vue -->
<template>
  <div class="scenic-list">
    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-input v-model="searchKeyword" placeholder="搜索景区..." clearable style="width: 240px" @input="handleSearch" />
      <el-select v-model="selectedCity" placeholder="选择城市" clearable @change="handleFilterChange">
        <el-option v-for="city in cities" :key="city" :label="city" :value="city" />
      </el-select>
      <el-select v-model="selectedLevel" placeholder="景区等级" clearable @change="handleFilterChange">
        <el-option label="5A" value="5A" />
        <el-option label="4A" value="4A" />
        <el-option label="3A" value="3A" />
      </el-select>
    </div>

    <!-- 卡片网格 -->
    <LoadingSpinner v-if="loading" />
    <el-empty v-else-if="sceneries.length === 0" description="暂无景区数据" />
    <div v-else class="card-grid">
      <ScenicCard v-for="scenic in sceneries" :key="scenic.id" :scenic="scenic" :warning="getWarning(scenic.id)" />
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="total > 0">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="loadData"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getSceneries, getScenicCities } from '../../api/scenic';
import ScenicCard from './ScenicCard.vue';
import LoadingSpinner from '../common/LoadingSpinner.vue';

const sceneries = ref([]);
const cities = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = 12;
const total = ref(0);
const searchKeyword = ref('');
const selectedCity = ref('');
const selectedLevel = ref('');

// 模拟预警数据（实际可从store或单独请求获取）
const warnings = ref([]);

const getWarning = (scenicId) => {
  return warnings.value.find(w => w.scenic_id === scenicId) || null;
};

async function loadData() {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      pageSize,
      city: selectedCity.value || undefined,
      level: selectedLevel.value || undefined,
      keyword: searchKeyword.value || undefined
    };
    const res = await getSceneries(params);
    sceneries.value = res.data;
    total.value = res.pagination.total;
  } catch (e) {
    console.error(e);
  }
  loading.value = false;
}

function handleSearch() {
  currentPage.value = 1;
  loadData();
}

function handleFilterChange() {
  currentPage.value = 1;
  loadData();
}

onMounted(async () => {
  try {
    const [cityRes] = await Promise.all([
      getScenicCities(),
      loadData()
    ]);
    cities.value = cityRes.data;
    // 可选：获取预警数据
    // const warnRes = await getWarnings();
    // warnings.value = warnRes.data;
  } catch (e) {
    console.error(e);
  }
});
</script>

<style scoped>
.scenic-list { max-width: 1200px; margin: 0 auto; padding: 20px; }
.filter-bar { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
.card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
.pagination { display: flex; justify-content: center; margin-top: 30px; }
</style>
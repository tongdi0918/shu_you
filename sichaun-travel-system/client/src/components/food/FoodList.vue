<!-- client/src/components/food/FoodList.vue -->
<template>
  <div class="food-list">
    <div class="filter-bar">
      <el-input v-model="searchKeyword" placeholder="搜索美食..." clearable style="width: 240px" @input="handleSearch" />
      <el-select v-model="selectedCity" placeholder="选择城市" clearable @change="handleFilterChange">
        <el-option v-for="city in cities" :key="city" :label="city" :value="city" />
      </el-select>
      <el-select v-model="selectedCategory" placeholder="分类" clearable @change="handleFilterChange">
        <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
      </el-select>
    </div>

    <LoadingSpinner v-if="loading" />
    <el-empty v-else-if="foods.length === 0" description="暂无美食数据" />
    <div v-else class="card-grid">
      <FoodCard v-for="food in foods" :key="food.id" :food="food" />
    </div>

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
import { getFoods, getFoodCategories } from '../../api/food';
import FoodCard from './FoodCard.vue';
import LoadingSpinner from '../common/LoadingSpinner.vue';

const foods = ref([]);
const cities = ref(['成都市', '乐山市', '宜宾市', '自贡市', '绵阳市']); // 可改为动态获取
const categories = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = 12;
const total = ref(0);
const searchKeyword = ref('');
const selectedCity = ref('');
const selectedCategory = ref('');

async function loadData() {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      pageSize,
      city: selectedCity.value || undefined,
      category: selectedCategory.value || undefined,
      keyword: searchKeyword.value || undefined
    };
    const res = await getFoods(params);
    foods.value = res.data;
    total.value = res.pagination.total;
  } catch (e) { console.error(e); }
  loading.value = false;
}

function handleSearch() { currentPage.value = 1; loadData(); }
function handleFilterChange() { currentPage.value = 1; loadData(); }

onMounted(async () => {
  try {
    const catRes = await getFoodCategories();
    categories.value = catRes.data;
    await loadData();
  } catch (e) { console.error(e); }
});
</script>

<style scoped>
.food-list { max-width: 1200px; margin: 0 auto; padding: 20px; }
.filter-bar { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
.card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
.pagination { display: flex; justify-content: center; margin-top: 30px; }
</style>
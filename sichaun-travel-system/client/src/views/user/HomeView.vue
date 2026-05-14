<!-- client/src/views/user/HomeView.vue -->
<template>
  <div class="home-page">
    <!-- 头部 Banner -->
    <section class="hero" :style="{ backgroundImage: `url('/images/sichuan-hero.jpg')` }">
      <div class="hero-overlay">
        <h1>天府之国 · 四川</h1>
        <p>探秘蜀地山水,品味川味人间|18大5A景区等你来</p>
        <el-button type="warning" size="large" round @click="$router.push('/recommend')">🎯 智能推荐旅行</el-button>
      </div>
    </section>
    <!-- 景区栏目 -->
    <section class="section">
      <h2 class="section-title">🏔️ 四川 5A 级景区</h2>
      <div class="card-grid">
        <ScenicCard v-for="scenic in sceneries" :key="scenic.id" :scenic="scenic" />
      </div>
    </section>
    <!-- 美食栏目 -->
    <section class="section">
      <h2 class="section-title">🍜 天府名菜</h2>
      <div class="card-grid">
        <FoodCard v-for="food in foods" :key="food.id" :food="food" />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getSceneries } from '../../api/scenic';
import { getFoods } from '../../api/food';
import ScenicCard from '../../components/scenic/ScenicCard.vue';
import FoodCard from '../../components/food/FoodCard.vue';

const sceneries = ref([]);
const foods = ref([]);

onMounted(async () => {
    const [sRes, fRes] = await Promise.all([getSceneries(), getFoods()]);
    sceneries.value = sRes.data;
    foods.value = fRes.data;
});
</script>

<style scoped>
.hero { height: 400px; background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; }
.hero-overlay { text-align: center; color: #fff; background: rgba(0,0,0,0.45); padding: 40px 60px; border-radius: 16px; }
.hero-overlay h1 { font-size: 42px; margin: 0 0 10px; }
.hero-overlay p { font-size: 18px; margin: 0 0 20px; }
.section { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
.section-title { font-size: 24px; font-weight: 700; color: #2c3e50; margin-bottom: 20px; border-left: 4px solid #f5576c; padding-left: 12px; }
.card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
</style>
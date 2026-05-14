<!-- client/src/components/food/FoodCard.vue -->
<template>
  <div class="food-card"@click="goDetail">
    <div class="card-image" :style="{ backgroundImage: `url(${food.image_url || '/images/food-default.jpg'})` }">
      <div class="price-badge">¥{{ food.avg_price }}</div>
    </div>
    <div class="card-body">
      <div class="card-header">
        <h3 class="card-title">{{ food.name }}</h3>
        <span class="rating">⭐ {{ food.rating }}</span>
      </div>
      <p class="card-location">📍 {{ food.city }}</p>
      <span class="category-tag">{{ food.category }}</span>
      <p class="card-description">{{ truncate(food.description, 60) }}</p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const props = defineProps({ food: Object });

const router = useRouter();
const goDetail = () => {
  router.push({ name: 'FoodDetail', params: { id: props.food.id } });
};
const truncate = (text, len) => text?.length > len ? text.slice(0, len) + '...' : text
</script>

<style scoped>
.food-card {
    border-radius: 12px;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    transition: transform 0.3s, box-shadow 0.3s;
    cursor: pointer;
}
.food-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}
.card-image {
    height: 160px;
    background-size: cover;
    background-position: center;
    position: relative;
}
.price-badge {
    position: absolute;
    bottom: 10px;
    right: 10px;
    background: rgba(0,0,0,0.7);
    color: #fff;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 600;
}
.card-body { padding: 14px; }
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
}
.card-title {
    font-size: 17px;
    font-weight: 700;
    color: #2c3e50;
    margin: 0;
}
.rating { color: #f56c6c; font-size: 13px; }
.card-location { font-size: 12px; color: #909399; margin: 0 0 6px; }
.category-tag {
    display: inline-block;
    background: #fff3e0;
    color: #e6a23c;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 11px;
    margin-bottom: 8px;
}
.card-description {
    font-size: 13px;
    color: #606266;
    line-height: 1.5;
    margin: 0;
}
</style>
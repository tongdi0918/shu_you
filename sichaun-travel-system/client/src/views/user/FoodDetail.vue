<template>
  <div class="food-detail">
    <div class="detail-header">
      <h1>{{ food.name }}</h1>
      <div class="detail-meta">
        <span>💰 ¥{{ food.avg_price }}</span>
        <span>⭐ {{ food.rating }}</span>
        <span>📍 {{ food.city }}</span>
        <span>🍽️ {{ food.category }}</span>
      </div>
    </div>
    
    <div class="detail-image" v-if="food.image_url">
      <img :src="food.image_url" :alt="food.name" />
    </div>
    
    <div class="detail-description">
      <h3>美食介绍</h3>
      <p>{{ food.description }}</p>
    </div>
    
    <div class="detail-back">
      <button @click="$router.back()">返回列表</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const food = ref({});

onMounted(async () => {
  try {
    const id = route.params.id;
    const response = await axios.get(`/api/food/${id}`);
    food.value = response.data;
  } catch (error) {
    console.error('获取美食详情失败', error);
  }
});
</script>

<style scoped>
.food-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
.detail-header h1 {
  font-size: 28px;
  margin-bottom: 16px;
}
.detail-meta {
  display: flex;
  gap: 20px;
  color: #666;
  margin-bottom: 20px;
}
.detail-image img {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 8px;
}
.detail-description {
  margin: 20px 0;
  line-height: 1.8;
}
.detail-back button {
  padding: 8px 20px;
  cursor: pointer;
}
</style>
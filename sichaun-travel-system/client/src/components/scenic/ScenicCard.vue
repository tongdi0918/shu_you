<!-- client/src/components/scenic/ScenicCard.vue -->
<template>
  <div class="scenic-card" @click="$router.push(`/scenic/${scenic.id}`)">
    <div class="card-image" :style="{ backgroundImage: `url(${scenic.image_url || '/images/default.jpg'})` }">
      <div class="level-badge">{{ scenic.level }}级景区</div>
    </div>
    <div class="card-body">
      <h3 class="card-title">{{ scenic.name }}</h3>
      <p class="card-location">📍 {{ scenic.city }}</p>
      <p class="card-story">{{ truncate(scenic.description, 80) }}</p>
      <div class="card-tags">
        <el-tag v-for="tag in tagList" :key="tag" size="small" type="info">{{ tag }}</el-tag>
      </div>
      <div class="card-footer">
        <span class="price" v-if="scenic.ticket_price">💰 ¥{{ scenic.ticket_price }}</span>
        <span class="rating">⭐ {{ scenic.rating }}</span>
        <WarningBadge v-if="hasWarning" :warning="warning" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import WarningBadge from '../weather/WarningBadge.vue';
const props = defineProps({ scenic: Object, warning: Object });
const tagList = computed(() => props.scenic.tags ? props.scenic.tags.split(',') : []);
const hasWarning = computed(() => props.warning && props.warning.congestion_level === 'high');
const truncate = (str, len) => str ? (str.length > len ? str.slice(0,len)+'...' : str) : '';
</script>

<style scoped>
.scenic-card {
    border-radius: 12px; overflow: hidden; cursor: pointer; background: #fff;
    box-shadow: 0 2px 12px rgba(0,0,0,0.08); transition: transform 0.3s, box-shadow 0.3s;
}
.scenic-card:hover { transform: translateY(-4px); box-shadow: 0 6px 20px rgba(0,0,0,0.15); }
.card-image { height: 180px; background-size: cover; background-position: center; position: relative; }
.level-badge { position: absolute; top: 10px; right: 10px; background: linear-gradient(135deg, #f093fb, #f5576c);
              color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
.card-body { padding: 16px; }
.card-title { font-size: 18px; font-weight: 700; color: #2c3e50; margin: 0 0 4px; }
.card-location { font-size: 13px; color: #909399; margin: 0 0 6px; }
.card-story { font-size: 13px; color: #606266; line-height: 1.5; margin: 0 0 10px; }
.card-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
.card-footer { display: flex; justify-content: space-between; align-items: center; font-size: 13px; }
.price { color: #e6a23c; font-weight: 600; }
.rating { color: #f56c6c; }
</style>
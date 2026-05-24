<template>
  <div class="food-card" @click="goDetail">
    <div class="food-card-image">
      <img :src="food.image_url" :alt="food.name" />
      <div class="food-card-badge">{{ food.category }}</div>
    </div>
    <div class="food-card-body">
      <h3 class="food-card-name">{{ food.name }}</h3>
      <p class="food-card-city">?? {{ food.city }}</p>
      <!-- 增强描述：展示更多文字信息 -->
      <p class="food-card-desc">{{ truncate(food.description, 80) }}</p>
      <div class="food-card-tags">
        <span class="food-tag" v-for="tag in parseTags(food.tags)" :key="tag">{{ tag }}</span>
      </div>
      <div class="food-card-footer">
        <span class="food-price">?? 人均 ￥{{ food.avg_price }}</span>
        <span class="food-rating">? {{ food.rating }}</span>
        <span class="food-favorite" @click.stop="toggleFavorite">?? 收藏</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { recordBehavior } from '@/api/recommend'
import { recordBrowse } from '@/api/user'
import { addFavorite, deleteFavorite } from '@/api/user'
import { ElMessage } from 'element-plus'

const props = defineProps({
  food: { type: Object, required: true }
})

const router = useRouter()
const userStore = useUserStore()

// 解析标签
function parseTags(tags) {
  if (!tags) return []
  return tags.split(',').filter(Boolean).slice(0, 3)
}

// 截断文本
function truncate(text, len) {
  if (!text) return ''
  return text.length > len ? text.slice(0, len) + '...' : text
}

// 跳转详情
function goDetail() {
  // 记录浏览行为
  if (userStore.isLoggedIn) {
    recordBrowse({ itemType: 'food', itemId: props.food.id }).catch(() => {})
    recordBehavior({ itemType: 'food', itemId: props.food.id, action: 'view' }).catch(() => {})
  }
  router.push(`/food/${props.food.id}`)
}

// 收藏/取消收藏
async function toggleFavorite() {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }
  try {
    await addFavorite({ itemType: 'food', itemId: props.food.id })
    ElMessage.success('收藏成功')
  } catch {
    ElMessage.info('已收藏或操作失败')
  }
}
</script>

<style scoped>
.food-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}
.food-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}
.food-card-image {
  position: relative;
  height: 180px;
  overflow: hidden;
}
.food-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.food-card-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #e74c3c;
  color: #fff;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
}
.food-card-body {
  padding: 12px 16px;
}
.food-card-name {
  margin: 0 0 4px;
  font-size: 18px;
  color: #2c3e50;
}
.food-card-city {
  margin: 0 0 8px;
  font-size: 13px;
  color: #7f8c8d;
}
.food-card-desc {
  margin: 0 0 10px;
  font-size: 13px;
  color: #555;
  line-height: 1.5;
}
.food-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}
.food-tag {
  background: #fef0f0;
  color: #e74c3c;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
}
.food-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
  font-size: 13px;
  color: #666;
}
.food-price { color: #e67e22; font-weight: bold; }
.food-rating { color: #f39c12; }
.food-favorite { color: #e74c3c; cursor: pointer; }
.food-favorite:hover { color: #c0392b; }
</style>
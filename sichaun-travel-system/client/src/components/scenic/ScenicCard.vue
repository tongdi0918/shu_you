<!-- client/src/components/scenic/ScenicCard.vue -->
<template>
  <el-card class="scenic-card" shadow="hover" @click="goDetail">
    <img :src="scenic.image_url || '/placeholder.jpg'" class="card-image" />
    <div class="card-badge">{{ scenic.level }}级景区</div>
    <div class="card-content">
      <h3>{{ scenic.name }}</h3>
      <p class="city">{{ scenic.city }}</p>
      <p class="desc">{{ truncate(scenic.description, 60) }}</p>
      <div class="tags">
        <el-tag v-for="tag in parseTags(scenic.tags)" :key="tag" size="small">{{ tag }}</el-tag>
      </div>
      <div class="footer">
        <span class="price">¥{{ scenic.ticket_price }}</span>
        <span class="rating">⭐ {{ scenic.rating }}</span>
      </div>
      <div class="actions" @click.stop>
        <el-button size="small" type="warning" @click="handleFavorite">
          <el-icon><Star /></el-icon> 收藏
        </el-button>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { addFavorite, recordBrowse } from '../../api/user';
import { useUserStore } from '../../stores/userStore';
import { ElMessage } from 'element-plus';

const props = defineProps({
  scenic: { type: Object, required: true },
});

const router = useRouter();
const userStore = useUserStore();

const truncate = (text, len) => {
  if (!text) return '';
  return text.length > len ? text.substring(0, len) + '...' : text;
};

const parseTags = (tags) => {
  if (!tags) return [];
  return tags.split(',').filter(Boolean);
};

const goDetail = () => {
  if (userStore.isLoggedIn) {
    recordBrowse({ itemType: 'scenery', itemId: props.scenic.id }).catch(() => {});
  }
  router.push(`/scenic/${props.scenic.id}`);
};

const handleFavorite = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录');
    router.push('/login');
    return;
  }
  try {
    await addFavorite({ itemType: 'scenery', itemId: props.scenic.id });
    ElMessage.success('收藏成功');
  } catch (e) {
    ElMessage.error('收藏失败');
  }
};
</script>

<style scoped>
.scenic-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: transform 0.3s;
  position: relative;
  overflow: hidden;
}

.scenic-card:hover {
  transform: translateY(-5px);
}

.card-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.card-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #667eea;
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
}

.card-content {
  padding: 12px 0;
}

.card-content h3 {
  font-size: 18px;
  margin-bottom: 4px;
}

.city {
  color: #999;
  font-size: 13px;
  margin-bottom: 8px;
}

.desc {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
  line-height: 1.5;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.price {
  color: #e6a23c;
  font-weight: bold;
  font-size: 16px;
}

.rating {
  color: #f56c6c;
}

.actions {
  text-align: right;
}
</style>
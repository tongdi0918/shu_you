<!-- sichaun-travel-system/client/src/views/user/FavoritesView.vue -->
<template>
  <div class="favorites-page">
    <div class="page-header">
      <h2>❤️ 我的收藏</h2>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="loading-container">
      <el-icon class="is-loading" :size="32"><Loading /></el-icon>
      <p>加载中...</p>
    </div>

    <!-- 空状态 -->
    <el-empty v-else-if="favorites.length === 0" description="还没有收藏哦，快去看看吧~" />

    <!-- 收藏列表 -->
    <div v-else class="favorites-list">
      <div 
        class="favorite-item" 
        v-for="item in favorites" 
        :key="item.fav_id"
        @click="goDetail(item)"
      >
        <img 
          :src="item.item_image || '/placeholder.jpg'" 
          :alt="item.item_name"
          class="fav-image"
        />
        <div class="fav-info">
          <div class="fav-header">
            <h3>{{ item.item_name }}</h3>
            <el-tag :type="item.item_type === 'scenery' ? 'success' : 'danger'" size="small">
              {{ item.item_type === 'scenery' ? '景区' : '美食' }}
            </el-tag>
          </div>
          <p class="fav-city">{{ item.item_city }}</p>
          <div class="fav-meta">
            <span class="fav-rating">⭐ {{ item.item_rating }}</span>
            <span class="fav-price">
              {{ item.item_type === 'scenery' ? `¥${item.item_price}` : `¥${item.item_price}/人` }}
            </span>
          </div>
          <p class="fav-time">收藏于 {{ formatTime(item.fav_time) }}</p>
        </div>
        <el-button 
          type="danger" 
          size="small" 
          circle 
          @click.stop="removeFavorite(item)"
          :loading="removingId === item.fav_id"
        >
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';

const router = useRouter();
const favorites = ref([]);
const loading = ref(true);
const removingId = ref(null);

// 加载收藏列表
const loadFavorites = async () => {
  loading.value = true;
  const token = localStorage.getItem('token');
  if (!token) {
    ElMessage.warning('请先登录');
    router.push('/login');
    return;
  }

  try {
    const response = await fetch('/api/user/favorites', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await response.json();
    if (result.code === 200) {
      favorites.value = result.data || [];
    }
  } catch (error) {
    ElMessage.error('获取收藏列表失败');
  } finally {
    loading.value = false;
  }
};

// 跳转详情
const goDetail = (item) => {
  if (item.item_type === 'scenery') {
    router.push(`/scenic/${item.item_id}`);
  } else {
    router.push(`/food/${item.item_id}`);
  }
};

// 取消收藏
const removeFavorite = async (item) => {
  try {
    await ElMessageBox.confirm(`确定取消收藏「${item.item_name}」吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
  } catch {
    return;
  }

  removingId.value = item.fav_id;
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(
      `/api/user/favorites/${item.item_id}?type=${item.item_type}`,
      {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    const result = await response.json();
    if (result.code === 200) {
      favorites.value = favorites.value.filter(f => f.fav_id !== item.fav_id);
      ElMessage.success('已取消收藏');
    }
  } catch (error) {
    ElMessage.error('操作失败');
  } finally {
    removingId.value = null;
  }
};

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(() => {
  loadFavorites();
});
</script>

<style scoped>
.favorites-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 20px;
}

.page-header {
  background: linear-gradient(135deg, #E44D26, #FF6B6B);
  color: white;
  padding: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #909399;
}

.favorites-list {
  padding: 12px;
}

.favorite-item {
  background: white;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  cursor: pointer;
  transition: transform 0.2s;
}

.favorite-item:hover {
  transform: translateX(4px);
}

.fav-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.fav-info {
  flex: 1;
  min-width: 0;
}

.fav-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.fav-header h3 {
  margin: 0;
  font-size: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fav-city {
  font-size: 12px;
  color: #909399;
  margin: 4px 0;
}

.fav-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
}

.fav-rating { color: #F57C00; }
.fav-price { color: #E44D26; font-weight: 600; }

.fav-time {
  font-size: 11px;
  color: #C0C4CC;
  margin-top: 4px;
}
</style>
<!-- sichaun-travel-system/client/src/views/user/ScenicDetail.vue -->
<template>
  <div class="scenic-detail">
    <!-- 操作按钮栏 -->
    <div class="top-actions">
      <el-button @click="$router.push('/')" type="default" size="small">
        <el-icon><HomeFilled /></el-icon> 返回首页
      </el-button>
      <el-button @click="$router.back()" type="default" size="small">
        <el-icon><ArrowLeft /></el-icon> 返回列表
      </el-button>
    </div>

    <!-- 主图 -->
    <div class="hero" v-if="scenic.image_url">
      <img :src="scenic.image_url" :alt="scenic.name" class="hero-image" />
      <div class="hero-text">
        <h1>{{ scenic.name }}</h1>
        <p>{{ scenic.city }} · {{ scenic.level }}</p>
      </div>
    </div>

    <div v-else class="no-image-title">
      <h1>{{ scenic.name }}</h1>
      <p>{{ scenic.city }} · {{ scenic.level }}</p>
    </div>

    <!-- 核心信息卡片 -->
    <div class="info-cards">
      <div class="info-card">
        <div class="value">¥{{ scenic.ticket_price }}</div>
        <div class="label">门票价格</div>
      </div>
      <div class="info-card">
        <div class="value">⭐ {{ scenic.rating }}</div>
        <div class="label">评分</div>
      </div>
      <div class="info-card">
        <div class="value">{{ scenic.city }}</div>
        <div class="label">所在城市</div>
      </div>
      <div class="info-card">
        <div class="value">{{ scenic.level || '暂无' }}</div>
        <div class="label">景区级别</div>
      </div>
    </div>

    <!-- 标签 -->
    <div class="tags" v-if="scenic.tags">
      <el-tag v-for="tag in tagList" :key="tag" class="tag-item" type="success" effect="plain">
        {{ tag }}
      </el-tag>
    </div>

    <!-- 景区介绍 -->
    <div class="section description-section">
      <h2>📖 景区介绍</h2>
      <p class="description-text">{{ scenic.description }}</p>
      <div class="extra-info">
        <p><strong>📍 地址：</strong>{{ scenic.address }}</p>
        <p v-if="scenic.open_time"><strong>🕒 开放时间：</strong>{{ scenic.open_time }}</p>
        <p v-if="scenic.season_best"><strong>🌸 最佳季节：</strong>{{ scenic.season_best }}</p>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="actions">
      <el-button type="danger" size="large" @click="toggleFavorite" :loading="favLoading">
        <el-icon><Star /></el-icon> {{ isFavorited ? '已收藏' : '收藏景区' }}
      </el-button>
      <el-button type="primary" size="large" @click="goToRoutePlan">
        <el-icon><MapLocation /></el-icon> 规划路线
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();

const scenic = ref({});
const isFavorited = ref(false);
const favLoading = ref(false);

const tagList = computed(() => {
  if (!scenic.value.tags) return [];
  return scenic.value.tags.split(',').map(t => t.trim()).filter(Boolean);
});

const loadScenic = async () => {
  try {
    const id = route.params.id;
    const response = await fetch(`/api/scenic/${id}`);
    if (!response.ok) throw new Error('服务器错误');
    const result = await response.json();
    if (result.code === 200) {
      scenic.value = result.data;
      await checkFavorite();
    } else {
      ElMessage.error(result.msg || '获取景区信息失败');
    }
  } catch (error) {
    console.error('获取景区详情失败:', error);
    ElMessage.error('获取景区信息失败，请稍后重试');
  }
};

const checkFavorite = async () => {
  const token = localStorage.getItem('token');
  if (!token) return;
  try {
    const response = await fetch('/api/user/favorites', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await response.json();
    if (result.code === 200 && result.data) {
      isFavorited.value = result.data.some(
        fav => fav.item_type === 'scenery' && fav.item_id === scenic.value.id
      );
    }
  } catch (e) { /* 静默失败 */ }
};

const toggleFavorite = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    ElMessage.warning('请先登录');
    router.push('/login');
    return;
  }
  favLoading.value = true;
  try {
    if (isFavorited.value) {
      await fetch(`/api/user/favorites/${scenic.value.id}?type=scenery`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      isFavorited.value = false;
      ElMessage.success('已取消收藏');
    } else {
      await fetch('/api/user/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ itemType: 'scenery', itemId: scenic.value.id })
      });
      isFavorited.value = true;
      ElMessage.success('收藏成功');
    }
  } catch (e) {
    ElMessage.error('操作失败');
  } finally {
    favLoading.value = false;
  }
};

// 在获取到景区数据后调用
const recordHistory = async () => {
  const token = localStorage.getItem('token');
  if (!token) return;
  try {
    await fetch('/api/user/history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        itemType: 'scenery',
        itemId: route.params.id
      })
    });
  } catch (e) {
    // 静默失败
  }
};



const goToRoutePlan = () => {
  router.push({
    path: '/route-plan',
    query: { destination: scenic.value.name, lat: scenic.value.latitude, lng: scenic.value.longitude }
  });
};

onMounted(loadScenic);
</script>

<style scoped>
.scenic-detail {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}

.top-actions {
  display: flex;
  gap: 10px;
  padding: 12px 16px;
  background: white;
}

.hero {
  position: relative;
  height: 260px;
  overflow: hidden;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-text {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 30px 20px 16px;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  color: white;
}

.hero-text h1 {
  margin: 0;
  font-size: 26px;
}

.hero-text p {
  margin: 4px 0 0;
  font-size: 14px;
  opacity: 0.9;
}

.no-image-title {
  padding: 20px;
  background: white;
}

.no-image-title h1 {
  margin: 0;
  font-size: 24px;
}

.no-image-title p {
  margin: 4px 0 0;
  color: #909399;
}

.info-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 16px;
}

.info-card {
  background: white;
  border-radius: 12px;
  padding: 14px;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.value {
  font-size: 20px;
  font-weight: 700;
  color: #E44D26;
}

.label {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.tags {
  padding: 0 16px 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  border-radius: 16px;
}

.section {
  margin: 0 16px 16px;
  background: white;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.section h2 {
  margin: 0 0 12px;
  font-size: 18px;
  color: #303133;
}

.description-text {
  font-size: 15px;
  line-height: 1.8;
  color: #606266;
  text-align: justify;
}

.extra-info p {
  margin: 8px 0;
  font-size: 14px;
  color: #606266;
}

.actions {
  display: flex;
  gap: 12px;
  padding: 0 16px;
  justify-content: center;
  margin-top: 20px;
}
</style>
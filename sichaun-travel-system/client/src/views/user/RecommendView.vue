<!-- sichaun-travel-system/client/src/views/user/RecommendView.vue -->
<template>
  <div class="recommend-page">
    <!-- 头部 -->
    <div class="top-bar">
      <el-button @click="$router.push('/')" size="small" type="default">
        <el-icon><HomeFilled /></el-icon> 返回首页
      </el-button>
    </div>
    <div class="recommend-header">
      <h2>🎯 为您量身定制的四川旅行推荐</h2>
      <p class="subtitle">基于协同过滤算法，根据您的历史浏览与偏好智能推荐</p>
    </div>

    <!-- 景区推荐 -->
    <div class="section">
      <div class="section-header">
        <h3>🏞️ 景点推荐</h3>
        <el-button type="primary" size="small" @click="refreshScenery" :loading="sceneryLoading">
          <el-icon><Refresh /></el-icon> 换一批
        </el-button>
      </div>
      
      <div class="recommend-grid" v-if="sceneryList.length > 0">
        <div 
          class="recommend-card" 
          v-for="item in sceneryList" 
          :key="item.id"
          @click="goScenicDetail(item.id)"
        >
          <img :src="item.image_url" :alt="item.name" class="card-image" />
          <div class="card-body">
            <h4>{{ item.name }}</h4>
            <p class="card-city">{{ item.city }} · {{ item.level }}</p>
            <div class="card-info">
              <span class="rating">⭐ {{ item.rating }}</span>
              <span class="price">¥{{ item.ticket_price }}</span>
            </div>
            <!-- 推荐依据 -->
            <div class="recommend-reasons" v-if="sceneryReasons[item.id]">
              <el-tag 
                v-for="reason in sceneryReasons[item.id]" 
                :key="reason" 
                size="small" 
                effect="plain"
                type="warning"
                class="reason-tag"
              >
                {{ reason }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
      <el-empty v-else description="暂无推荐景点" />
    </div>

    <!-- 美食推荐 -->
    <div class="section">
      <div class="section-header">
        <h3>🍜 美食推荐</h3>
        <el-button type="primary" size="small" @click="refreshFood" :loading="foodLoading">
          <el-icon><Refresh /></el-icon> 换一批
        </el-button>
      </div>
      
      <div class="recommend-grid" v-if="foodList.length > 0">
        <div 
          class="recommend-card" 
          v-for="item in foodList" 
          :key="item.id"
          @click="goFoodDetail(item.id)"
        >
          <img :src="item.image_url" :alt="item.name" class="card-image" />
          <div class="card-body">
            <h4>{{ item.name }}</h4>
            <p class="card-city">{{ item.city }} · {{ item.category }}</p>
            <div class="card-info">
              <span class="rating">⭐ {{ item.rating }}</span>
              <span class="price">¥{{ item.avg_price }}/人</span>
            </div>
            <!-- 推荐依据 -->
            <div class="recommend-reasons" v-if="foodReasons[item.id]">
              <el-tag 
                v-for="reason in foodReasons[item.id]" 
                :key="reason" 
                size="small" 
                effect="plain"
                type="success"
                class="reason-tag"
              >
                {{ reason }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
      <el-empty v-else description="暂无推荐美食" />
    </div>

    <!-- 底部操作 -->
    <div class="action-bar">
      <el-button type="success" size="large" @click="goRoutePlan">
        🗺️ 根据推荐生成路线
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const router = useRouter();

const sceneryList = ref([]);
const foodList = ref([]);
const sceneryReasons = ref({});
const foodReasons = ref({});
const sceneryLoading = ref(false);
const foodLoading = ref(false);

const token = () => localStorage.getItem('token');

// 加载初始推荐
const loadRecommendations = async () => {
  const t = token();
  if (!t) {
    // 未登录时加载热门推荐
    await loadPopular();
    return;
  }
  
  try {
    const response = await fetch('/api/recommend/user', {
      headers: { 'Authorization': `Bearer ${t}` }
    });
    const result = await response.json();
    if (result.code === 200) {
      sceneryList.value = result.data.scenery || [];
      foodList.value = result.data.food || [];
    }
  } catch (error) {
    console.error('获取推荐失败:', error);
  }
};

// 加载热门推荐（未登录时）
const loadPopular = async () => {
  try {
    const [sceneryRes, foodRes] = await Promise.all([
      fetch('/api/recommend/popular?type=scenery&limit=6'),
      fetch('/api/recommend/popular?type=food&limit=6')
    ]);
    const sceneryData = await sceneryRes.json();
    const foodData = await foodRes.json();
    if (sceneryData.code === 200) sceneryList.value = sceneryData.data;
    if (foodData.code === 200) foodList.value = foodData.data;
  } catch (error) {
    console.error('获取热门推荐失败:', error);
  }
};

// 换一批 - 景区
const refreshScenery = async () => {
  sceneryLoading.value = true;
  try {
    const excludeIds = sceneryList.value.map(item => item.id).join(',');
    const response = await fetch(
      `/api/recommend/refresh?type=scenery&exclude=${excludeIds}&limit=6`,
      { headers: { 'Authorization': `Bearer ${token()}` } }
    );
    const result = await response.json();
    if (result.code === 200) {
      sceneryList.value = result.data;
      sceneryReasons.value = result.reasons || {};
      ElMessage.success('已为您换一批景点推荐');
    }
  } catch (error) {
    ElMessage.error('刷新失败，请稍后重试');
  } finally {
    sceneryLoading.value = false;
  }
};

// 换一批 - 美食
const refreshFood = async () => {
  foodLoading.value = true;
  try {
    const excludeIds = foodList.value.map(item => item.id).join(',');
    const response = await fetch(
      `/api/recommend/refresh?type=food&exclude=${excludeIds}&limit=6`,
      { headers: { 'Authorization': `Bearer ${token()}` } }
    );
    const result = await response.json();
    if (result.code === 200) {
      foodList.value = result.data;
      foodReasons.value = result.reasons || {};
      ElMessage.success('已为您换一批美食推荐');
    }
  } catch (error) {
    ElMessage.error('刷新失败，请稍后重试');
  } finally {
    foodLoading.value = false;
  }
};

// 跳转详情
const goScenicDetail = (id) => {
  router.push(`/scenic/${id}`);
};

const goFoodDetail = (id) => {
  router.push(`/food/${id}`);
};

const goRoutePlan = () => {
  router.push('/route-plan');
};

onMounted(() => {
  loadRecommendations();
});
</script>

<style scoped>
.recommend-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}

.top-bar {
  padding: 10px 16px;
  background: white;
}

.recommend-header {
  background: linear-gradient(135deg, #E44D26, #F57C00);
  color: white;
  padding: 30px 20px;
  text-align: center;
}

.recommend-header h2 {
  margin: 0;
  font-size: 22px;
}

.subtitle {
  font-size: 13px;
  opacity: 0.85;
  margin-top: 8px;
}

.section {
  padding: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
}

.recommend-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.recommend-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  cursor: pointer;
  transition: transform 0.2s;
}

.recommend-card:hover {
  transform: translateY(-4px);
}

.card-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.card-body {
  padding: 10px;
}

.card-body h4 {
  margin: 0;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-city {
  font-size: 12px;
  color: #909399;
  margin: 4px 0;
}

.card-info {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.rating { color: #F57C00; font-weight: 600; }
.price { color: #E44D26; font-weight: 600; }

.recommend-reasons {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.reason-tag {
  font-size: 11px;
  white-space: normal;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 20px;
  background: white;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.08);
  display: flex;
  justify-content: center;
}
</style>
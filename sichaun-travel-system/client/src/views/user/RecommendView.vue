<template>
  <div class="recommend-page">
    <div class="recommend-container">
      <h2 class="page-title">🧠 为您量身定制的四川旅行推荐</h2>
      <p class="page-subtitle">基于协同过滤算法，根据您的历史浏览与收藏偏好智能推荐</p>

      <!-- 加载中 -->
      <div v-if="loading" class="loading-area">
        <el-skeleton :rows="6" animated />
      </div>

      <!-- 推荐结果 -->
      <div v-else>
        <!-- 智能行程规划 -->
        <div class="itinerary-section" v-if="itinerary.length > 0">
          <h3>🗓️ 推荐行程规划</h3>
          <p class="itinerary-hint">根据您的收藏和浏览习惯，我们为您规划了以下行程路线：</p>
          <div class="itinerary-flow">
            <template v-for="(item, idx) in itinerary" :key="idx">
              <div
                class="itinerary-block"
                :class="item.type"
              >
                <div class="itinerary-number">{{ idx + 1 }}</div>
                <div class="itinerary-icon">{{ item.type === 'scenery' ? '🏔️' : '🍜' }}</div>
                <div class="itinerary-name">{{ item.name }}</div>
                <div class="itinerary-type">{{ item.type === 'scenery' ? '景点' : '美食' }}</div>
                <div class="itinerary-city">📍 {{ item.city }}</div>
              </div>
              <!-- 箭头在每两个方块之间显示，最后一个不显示 -->
              <div v-if="idx < itinerary.length - 1" class="itinerary-arrow" :key="'arrow' + idx">→</div>
            </template>
          </div>
        </div>

        <!-- 推荐景点 -->
        <div class="recommend-section" v-if="recommendScenery.length > 0">
          <h3>🏔️ 推荐景点</h3>
          <div class="recommend-grid">
            <div
              v-for="scenic in recommendScenery"
              :key="'s-' + scenic.id"
              class="recommend-card"
              @click="$router.push(`/scenic/${scenic.id}`)"
            >
              <div class="card-image">
                <img :src="scenic.image_url" :alt="scenic.name" />
              </div>
              <div class="card-info">
                <h4>{{ scenic.name }}</h4>
                <p>{{ scenic.city }} | {{ scenic.level }}级</p>
                <p class="card-match">匹配度：{{ scenic.predictedRating || '85' }}%</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 推荐美食 -->
        <div class="recommend-section" v-if="recommendFood.length > 0">
          <h3>🍜 推荐美食</h3>
          <div class="recommend-grid">
            <div
              v-for="food in recommendFood"
              :key="'f-' + food.id"
              class="recommend-card food-card"
              @click="$router.push(`/food/${food.id}`)"
            >
              <div class="card-image">
                <img :src="food.image_url" :alt="food.name" />
              </div>
              <div class="card-info">
                <h4>{{ food.name }}</h4>
                <p>{{ food.city }} | ¥{{ food.avg_price }}</p>
                <p class="card-match">匹配度：{{ food.predictedRating || '82' }}%</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="recommendScenery.length === 0 && recommendFood.length === 0 && !loading" class="empty-area">
          <el-empty description="暂无推荐数据，请先浏览或收藏一些景点和美食" />
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-bar" v-if="itinerary.length > 0">
        <el-button type="primary" size="large" @click="generateRoute">🗺️ 根据推荐生成路线</el-button>
        <el-button size="large" @click="refreshRecommend">🔄 刷新推荐</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { getUserRecommend, getPopularRecommend } from '@/api/recommend'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(true)
const recommendScenery = ref([])
const recommendFood = ref([])
const itinerary = ref([])

async function loadRecommend() {
  loading.value = true
  try {
    if (userStore.isLoggedIn) {
      const res = await getUserRecommend()
      const data = res.data || res
      recommendScenery.value = data.scenery || []
      recommendFood.value = data.food || []
    } else {
      const [sceneryRes, foodRes] = await Promise.all([
        getPopularRecommend({ type: 'scenery', limit: 6 }),
        getPopularRecommend({ type: 'food', limit: 6 })
      ])
      recommendScenery.value = sceneryRes.data || sceneryRes || []
      recommendFood.value = foodRes.data || foodRes || []
    }
    generateItinerary()
  } catch (e) {
    console.error('加载推荐失败', e)
  }
  loading.value = false
}

function generateItinerary() {
  const plan = []
  const sceneries = recommendScenery.value.slice(0, 3)
  const foods = recommendFood.value.slice(0, 3)
  const maxLen = Math.max(sceneries.length, foods.length)
  for (let i = 0; i < maxLen; i++) {
    if (sceneries[i]) plan.push({ ...sceneries[i], type: 'scenery' })
    if (foods[i]) plan.push({ ...foods[i], type: 'food' })
  }
  itinerary.value = plan
}

function generateRoute() {
  router.push('/route-plan')
}

function refreshRecommend() {
  loadRecommend()
}

onMounted(() => {
  loadRecommend()
})
</script>

<style scoped>
.recommend-page { min-height: 100vh; background: #f5f5f5; }
.recommend-container { max-width: 1000px; margin: 0 auto; padding: 24px; }
.page-title { font-size: 24px; color: #2c3e50; margin-bottom: 8px; }
.page-subtitle { color: #999; font-size: 14px; margin-bottom: 24px; }

.itinerary-section { background: linear-gradient(135deg, #ffecd2, #fcb69f); border-radius: 16px; padding: 24px; margin-bottom: 24px; }
.itinerary-section h3 { margin: 0 0 8px; font-size: 20px; color: #7b3f00; }
.itinerary-hint { color: #8b5e3c; font-size: 13px; margin-bottom: 16px; }
.itinerary-flow { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: center; }
.itinerary-block {
  background: #fff; border-radius: 12px; padding: 16px; text-align: center; width: 140px;
  cursor: pointer; transition: transform 0.3s, box-shadow 0.3s; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.itinerary-block:hover { transform: translateY(-4px); box-shadow: 0 6px 16px rgba(0,0,0,0.2); }
.itinerary-block.scenery { border: 2px solid #3498db; }
.itinerary-block.food { border: 2px solid #e74c3c; }
.itinerary-number { background: #2c3e50; color: #fff; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; margin-bottom: 8px; }
.itinerary-icon { font-size: 28px; margin-bottom: 4px; }
.itinerary-name { font-weight: bold; font-size: 14px; color: #2c3e50; }
.itinerary-type { font-size: 11px; color: #999; }
.itinerary-city { font-size: 11px; color: #666; }
.itinerary-arrow { font-size: 20px; color: #999; line-height: 40px; }

.recommend-section { background: #fff; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
.recommend-section h3 { margin: 0 0 16px; font-size: 18px; color: #2c3e50; }
.recommend-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
.recommend-card { border: 1px solid #f0f0f0; border-radius: 12px; overflow: hidden; cursor: pointer; transition: transform 0.3s, box-shadow 0.3s; }
.recommend-card:hover { transform: translateY(-4px); box-shadow: 0 8px 20px rgba(0,0,0,0.12); }
.card-image { height: 140px; overflow: hidden; }
.card-image img { width: 100%; height: 100%; object-fit: cover; }
.card-info { padding: 12px; }
.card-info h4 { margin: 0 0 4px; font-size: 15px; color: #2c3e50; }
.card-info p { margin: 0 0 4px; font-size: 12px; color: #999; }
.card-match { color: #e74c3c !important; font-weight: bold; }

.loading-area { padding: 20px; }
.empty-area { padding: 40px; }
.action-bar { display: flex; gap: 16px; justify-content: center; padding: 20px 0; }
</style>
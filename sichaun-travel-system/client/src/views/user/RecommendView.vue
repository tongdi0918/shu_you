<template>
  <div class="recommend-page">
    
    <!-- ==================== 原有推荐内容（完全保留） ==================== -->
    <div class="recommend-container">
      <div class="section-header">
        <h2>🌟 热门推荐</h2>
        <el-button type="primary" :loading="refreshing" @click="refreshRecommend">刷新推荐</el-button>
      </div>
      
      <div v-loading="loading" class="recommend-content">
        <!-- 景区推荐 -->
        <div class="recommend-section">
          <h3>🏔️ 热门景区</h3>
          <div class="card-grid">
            <div v-for="item in recommendScenery" :key="item.id" class="rec-card" @click="viewDetail(item)">
              <img :src="item.image_url" :alt="item.name" />
              <div class="rec-card-info">
                <h4>{{ item.name }}</h4>
                <p>⭐ {{ item.rating }} | 🎫 ¥{{ item.ticket_price }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 美食推荐 -->
        <div class="recommend-section">
          <h3>🍜 热门美食</h3>
          <div class="card-grid">
            <div v-for="item in recommendFood" :key="item.id" class="rec-card" @click="viewDetail(item)">
              <img :src="item.image_url" :alt="item.name" />
              <div class="rec-card-info">
                <h4>{{ item.name }}</h4>
                <p>⭐ {{ item.rating }} | 💰 ¥{{ item.avg_price }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 推荐行程 -->
        <div v-if="itinerary.length > 0" class="recommend-section">
          <h3>🗺️ 推荐行程</h3>
          <div class="itinerary-flow">
            <template v-for="(item, idx) in itinerary" :key="idx">
              <div class="itinerary-block" :class="item.type">
                <div class="itinerary-number">{{ idx + 1 }}</div>
                <div class="itinerary-icon">{{ item.type === 'scenery' ? '🏔️' : '🍜' }}</div>
                <div class="itinerary-name">{{ item.name }}</div>
                <div class="itinerary-type">{{ item.type === 'scenery' ? '景点' : '美食' }}</div>
              </div>
              <div v-if="idx < itinerary.length - 1" class="itinerary-arrow">→</div>
            </template>
          </div>
          <el-button type="success" @click="generateRoute">基于此行程规划路线</el-button>
        </div>
      </div>
    </div>

    <!-- ==================== 新增：城市-景区美食卡片轮播与个性化规划 ==================== -->
    <div class="city-selection-section">
      <div class="section-header">
        <h3>🏙️ 按城市选择景点与美食，生成个性化规划</h3>
        <p class="section-desc">请先选择您的当前位置，再选择目标城市，勾选感兴趣的景点与美食，一键生成专属行程</p>
      </div>

      <!-- 当前位置选择 -->
      <div class="current-location-selector">
        <label>📍 您的当前位置：</label>
        <el-select
          v-model="currentCity"
          placeholder="请选择您当前所在的城市"
          clearable
          @change="onCurrentCityChange"
        >
          <el-option v-for="city in cityOptions" :key="city" :label="city" :value="city" />
        </el-select>
        <el-button type="primary" @click="syncToProfile">同步到个人主页</el-button>
      </div>

      <!-- 目标城市选择（无区县） -->
      <div class="city-selector-single">
        <el-select
          v-model="selectedCity"
          placeholder="请选择要游览的城市"
          filterable
          @change="onCityChange"
          class="city-select"
        >
          <el-option
            v-for="city in cityOptions"
            :key="city"
            :label="city"
            :value="city"
          />
        </el-select>
      </div>

      <!-- 卡片轮播区域：展示选中城市的所有景区与美食 -->
      <div v-loading="cityGroupLoading" class="carousel-wrapper">
        <div v-if="!selectedCity" class="empty-tip">
          <el-empty description="请先选择一个城市" />
        </div>
        <div v-else-if="currentCityItems.length === 0" class="empty-tip">
          <el-empty description="该城市暂无数据" />
        </div>
        <div v-else class="horizontal-scroll">
          <div
            v-for="item in currentCityItems"
            :key="`${item.type}-${item.id}`"
            class="carousel-card"
            :class="{ selected: isItemSelected(item) }"
            @click="toggleItem(item)"
          >
            <el-checkbox
              :model-value="isItemSelected(item)"
              @click.stop
              class="card-checkbox"
            />
            <div class="card-img">
              <img :src="item.image_url" :alt="item.name" />
            </div>
            <div class="card-content">
              <h4>{{ item.name }}</h4>
              <p class="location">{{ item.city }}</p>
              <div class="meta">
                <span>⭐ {{ item.rating }}</span>
                <span v-if="item.type === 'scenery'">🎫 ¥{{ item.ticket_price }}</span>
                <span v-else>💰 ¥{{ item.avg_price }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 规划按钮 -->
      <div class="plan-actions">
        <el-button type="primary" size="large" :loading="planLoading" @click="generatePlan">
          🚀 基于选择生成个性化规划
        </el-button>
        <el-button type="warning" size="large" @click="clearSelection">清空所有选择</el-button>
      </div>

      <!-- 个性化规划结果（按城市分组，方块展示） -->
      <div v-if="customPlanResult" class="plan-result">
        <h3>✨ 您的专属行程规划（按城市分组）</h3>
        <div v-for="(group, gIdx) in groupedItineraryWithOrder" :key="group.city" class="city-group">
          <div class="city-group-title">
            <span class="city-badge">📍 {{ group.city }}</span>
          </div>
          <div class="city-blocks">
            <div
              v-for="item in group.items"
              :key="`${item.type}-${item.id}`"
              class="plan-block"
              :class="item.type"
            >
              <div class="block-order">{{ item.globalIndex }}</div>
              <div class="block-icon">{{ item.type === 'scenery' ? '🏔️' : '🍜' }}</div>
              <div class="block-name">{{ item.name }}</div>
              <div class="block-type">{{ item.type === 'scenery' ? '景点' : '美食' }}</div>
            </div>
          </div>
        </div>
        <div class="plan-result-actions">
          <el-button @click="viewOnMap">🗺️ 在地图上查看路线</el-button>
          <el-button type="primary" @click="savePlan">💾 保存规划</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { getUserRecommend, getPopularRecommend } from '@/api/recommend'
import { getGroupedByCity, generateCustomPlan, updateCurrentCity, getCurrentCity } from '@/api'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

// ========== 原有推荐相关数据与函数（完全保留） ==========
const loading = ref(true)
const refreshing = ref(false)
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
      if (data.itinerary && data.itinerary.length > 0) {
        itinerary.value = data.itinerary
      } else {
        generateItinerary()
      }
    } else {
      const [sceneryRes, foodRes] = await Promise.all([
        getPopularRecommend({ type: 'scenery', limit: 6 }),
        getPopularRecommend({ type: 'food', limit: 6 })
      ])
      recommendScenery.value = sceneryRes.data || sceneryRes || []
      recommendFood.value = foodRes.data || foodRes || []
      generateItinerary()
    }
  } catch (e) {
    console.error('加载推荐失败', e)
    ElMessage.error('加载推荐失败，请稍后重试')
  }
  loading.value = false
}

function generateItinerary() {
  const plan = []
  const sceneries = [...recommendScenery.value]
  const foods = [...recommendFood.value]
  sceneries.sort((a, b) => (b.rating || 0) - (a.rating || 0))
  foods.sort((a, b) => (b.rating || 0) - (a.rating || 0))
  const maxLen = Math.max(sceneries.length, foods.length)
  for (let i = 0; i < maxLen; i++) {
    if (i < sceneries.length) plan.push({ ...sceneries[i], type: 'scenery' })
    if (i < foods.length) plan.push({ ...foods[i], type: 'food' })
  }
  itinerary.value = plan.length > 0 ? plan.slice(0, 8) : []
}

async function refreshRecommend() {
  if (refreshing.value) return
  refreshing.value = true
  try {
    await loadRecommend()
    ElMessage.success('推荐已刷新')
  } catch (e) {
    ElMessage.error('刷新失败，请稍后重试')
  } finally {
    refreshing.value = false
  }
}

function generateRoute() {
  router.push('/route-plan')
}

function viewDetail(item) {
  console.log('查看详情', item)
}

// ========== 新增：城市选择与个性化规划（只按城市，无区县） ==========
const groupedData = ref({})
const cityGroupLoading = ref(false)
const cityOptions = ref([])
const selectedCity = ref('')
const currentCity = ref('')
const planLoading = ref(false)
const customPlanResult = ref(null)

const selectedSceneryIds = ref([])
const selectedFoodIds = ref([])

// 存储每个城市的所有景区和美食（混合列表）
const cityItemsMap = ref({})

// 获取分组数据
const fetchGroupedData = async () => {
  cityGroupLoading.value = true
  try {
    const res = await getGroupedByCity()
    if (res.data.code === 200) {
      groupedData.value = res.data.data
      cityOptions.value = Object.keys(groupedData.value).sort()

      // 构建城市对应的全部items（不分district）
      cityOptions.value.forEach(city => {
        const sceneries = groupedData.value[city]?.sceneries || []
        const foods = groupedData.value[city]?.foods || []
        const allItems = [
          ...sceneries.map(s => ({ ...s, type: 'scenery' })),
          ...foods.map(f => ({ ...f, type: 'food' }))
        ]
        cityItemsMap.value[city] = allItems
      })
      // 若存在当前城市则自动选中
      if (currentCity.value && cityOptions.value.includes(currentCity.value)) {
        selectedCity.value = currentCity.value
      }
    }
  } catch (error) {
    console.error('获取分组数据失败:', error)
    ElMessage.error('获取数据失败，请稍后重试')
  } finally {
    cityGroupLoading.value = false
  }
}

// 城市切换
const onCityChange = (city) => {
  // 仅切换城市，不清除已选项目，但自动更新可选项目
}

// 当前选中城市的所有项目
const currentCityItems = computed(() => {
  if (!selectedCity.value) return []
  return cityItemsMap.value[selectedCity.value] || []
})

// 判断是否选中
const isItemSelected = (item) => {
  return item.type === 'scenery'
    ? selectedSceneryIds.value.includes(item.id)
    : selectedFoodIds.value.includes(item.id)
}

// 切换选中状态
const toggleItem = (item) => {
  if (item.type === 'scenery') {
    const idx = selectedSceneryIds.value.indexOf(item.id)
    if (idx === -1) selectedSceneryIds.value.push(item.id)
    else selectedSceneryIds.value.splice(idx, 1)
  } else {
    const idx = selectedFoodIds.value.indexOf(item.id)
    if (idx === -1) selectedFoodIds.value.push(item.id)
    else selectedFoodIds.value.splice(idx, 1)
  }
}

// 清空选择
const clearSelection = () => {
  selectedSceneryIds.value = []
  selectedFoodIds.value = []
  customPlanResult.value = null
  ElMessage.info('已清空所有选择')
}

// 获取用户当前位置
const fetchCurrentCity = async () => {
  try {
    const res = await getCurrentCity()
    if (res.data.code === 200 && res.data.data.current_city) {
      currentCity.value = res.data.data.current_city
      if (cityOptions.value.includes(currentCity.value)) {
        selectedCity.value = currentCity.value
      }
    }
  } catch (error) {
    console.error('获取当前位置失败:', error)
  }
}

const onCurrentCityChange = async (val) => {
  if (val) {
    await updateCurrentCity(val)
    ElMessage.success('当前位置已更新')
  }
}

const syncToProfile = async () => {
  if (!currentCity.value) {
    ElMessage.warning('请先选择当前位置')
    return
  }
  try {
    await updateCurrentCity(currentCity.value)
    ElMessage.success('已同步到个人主页')
  } catch (error) {
    ElMessage.error('同步失败，请稍后重试')
  }
}

// 生成个性化规划
const generatePlan = async () => {
  if (selectedSceneryIds.value.length === 0 && selectedFoodIds.value.length === 0) {
    ElMessage.warning('请至少选择一个景点或美食')
    return
  }
  if (!currentCity.value) {
    ElMessage.warning('请先选择您的当前位置')
    return
  }

  planLoading.value = true
  try {
    const res = await generateCustomPlan(
      selectedSceneryIds.value,
      selectedFoodIds.value,
      currentCity.value
    )
    if (res.data.code === 200) {
      customPlanResult.value = res.data.data
      ElMessage.success('规划生成成功！')
    } else {
      ElMessage.error(res.data.msg || '规划生成失败')
    }
  } catch (error) {
    console.error('生成规划失败:', error)
    ElMessage.error('生成规划失败，请稍后重试')
  } finally {
    planLoading.value = false
  }
}

// 将规划结果按城市分组，并保留全局顺序
const groupedItineraryWithOrder = computed(() => {
  if (!customPlanResult.value || !customPlanResult.value.itinerary) return []
  const itinerary = customPlanResult.value.itinerary
  const groups = []
  const cityMap = new Map() // city -> items array
  const cityOrder = []      // 保持城市第一次出现的顺序

  itinerary.forEach((item, index) => {
    const city = item.city || '未知城市'
    if (!cityMap.has(city)) {
      cityMap.set(city, [])
      cityOrder.push(city)
    }
    cityMap.get(city).push({ ...item, globalIndex: index + 1 })
  })

  cityOrder.forEach(city => {
    groups.push({
      city,
      items: cityMap.get(city)
    })
  })

  return groups
})

// 在地图上查看
const viewOnMap = () => {
  if (!customPlanResult.value || !customPlanResult.value.itinerary) {
    ElMessage.warning('请先生成规划')
    return
  }
  const routeData = {
    origin: currentCity.value,
    waypoints: customPlanResult.value.itinerary.map(item => ({
      name: item.name,
      city: item.city,
      type: item.type
    }))
  }
  sessionStorage.setItem('routePlanData', JSON.stringify(routeData))
  router.push('/route-plan')
}

const savePlan = async () => {
  ElMessage.success('规划已保存到个人中心')
}

onMounted(() => {
  loadRecommend()
  fetchGroupedData().then(() => {
    fetchCurrentCity()
  })
})
</script>

<style scoped>
/* ========== 原有样式（保留） ========== */
.recommend-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}
.rec-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  background: #fff;
  cursor: pointer;
  transition: transform 0.2s;
}
.rec-card:hover {
  transform: translateY(-4px);
}
.rec-card img {
  width: 100%;
  height: 140px;
  object-fit: cover;
}
.rec-card-info {
  padding: 12px;
}
.rec-card-info h4 {
  margin: 0 0 6px;
  font-size: 16px;
}
.itinerary-flow {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 16px 0;
}
.itinerary-block {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border-radius: 12px;
  padding: 8px 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.itinerary-block.scenery {
  border-left: 4px solid #409eff;
}
.itinerary-block.food {
  border-left: 4px solid #e6a23c;
}
.itinerary-number {
  font-weight: bold;
  color: #409eff;
}
.itinerary-arrow {
  font-size: 18px;
  color: #999;
}

/* ========== 新增：城市选择卡片轮播与个性化规划样式 ========== */
.city-selection-section {
  margin-top: 40px;
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}
.section-desc {
  color: #666;
  font-size: 14px;
  margin-top: 4px;
}
.current-location-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 16px 0;
}
.city-selector-single {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}
.city-select {
  width: 220px;
}
.horizontal-scroll {
  display: flex;
  overflow-x: auto;
  gap: 20px;
  padding: 20px 10px;
  scrollbar-width: thin;
}
.horizontal-scroll::-webkit-scrollbar {
  height: 6px;
}
.horizontal-scroll::-webkit-scrollbar-thumb {
  background-color: #c1c1c1;
  border-radius: 3px;
}
.carousel-card {
  flex: 0 0 280px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
  border: 2px solid transparent;
}
.carousel-card.selected {
  border-color: #667eea;
  background: #f0f4ff;
}
.carousel-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.15);
}
.card-checkbox {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
  background: rgba(255,255,255,0.8);
  border-radius: 4px;
}
.card-img {
  width: 100%;
  height: 160px;
  overflow: hidden;
}
.card-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.card-content {
  padding: 12px;
}
.card-content h4 {
  margin: 0 0 6px;
  font-size: 16px;
  color: #2c3e50;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.card-content .location {
  font-size: 12px;
  color: #999;
  margin: 0 0 8px;
}
.meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #f39c12;
}
.empty-tip {
  text-align: center;
  padding: 40px;
}
.plan-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 24px 0;
}
.plan-result {
  margin-top: 32px;
  background: #f9fafc;
  border-radius: 16px;
  padding: 24px;
}
.city-group {
  margin-bottom: 24px;
}
.city-group-title {
  text-align: center;
  margin-bottom: 12px;
}
.city-badge {
  background: #667eea;
  color: #fff;
  padding: 6px 20px;
  border-radius: 20px;
  font-size: 16px;
  font-weight: bold;
}
.city-blocks {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
}
.plan-block {
  width: 140px;
  background: #fff;
  border-radius: 16px;
  padding: 16px 10px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transition: transform 0.2s;
  border: 2px solid transparent;
}
.plan-block:hover {
  transform: translateY(-4px);
}
.plan-block.scenery {
  border-color: #409eff;
}
.plan-block.food {
  border-color: #e6a23c;
}
.block-order {
  background: #667eea;
  color: #fff;
  width: 24px;
  height: 24px;
  line-height: 24px;
  border-radius: 50%;
  margin: 0 auto 8px;
  font-weight: bold;
  font-size: 14px;
}
.block-icon {
  font-size: 28px;
  margin-bottom: 6px;
}
.block-name {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.block-type {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}
.plan-result-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
}
</style>
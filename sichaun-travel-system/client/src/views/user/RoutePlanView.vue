<template>
  <div class="route-plan-page">
    <div class="route-plan-container">
      <el-button type="link" @click="$router.push('/')" class="back-btn">← 返回首页</el-button>
      <h1 class="page-title">🗺️ 路程规划</h1>

      <!-- 输入区域 -->
      <div class="input-section">
        <el-row :gutter="16">
          <el-col :span="8">
            <el-input v-model="origin" placeholder="出发地（如：成都市）" clearable />
          </el-col>
          <el-col :span="8">
            <el-input v-model="destination" placeholder="目的地（如：九寨沟）" clearable />
          </el-col>
          <el-col :span="8">
            <el-button type="primary" @click="planRoute" :loading="loading" style="width:100%">
              🚗 规划路线
            </el-button>
          </el-col>
        </el-row>
        <el-row :gutter="16" style="margin-top:12px">
          <el-col :span="8">
            <el-input-number v-model="days" :min="1" :max="15" placeholder="计划天数" style="width:100%" />
          </el-col>
          <el-col :span="8">
            <el-input-number v-model="budget" :min="100" :step="100" placeholder="预算（元）" style="width:100%" />
          </el-col>
          <el-col :span="8">
            <el-select v-model="preference" multiple placeholder="偏好（可多选）" style="width:100%">
              <el-option label="自然风光" value="natural" />
              <el-option label="历史文化" value="culture" />
              <el-option label="美食之旅" value="food" />
              <el-option label="休闲摄影" value="relax" />
              <el-option label="户外探险" value="adventure" />
            </el-select>
          </el-col>
        </el-row>
      </div>

      <!-- 地图容器 -->
      <div class="map-container" v-loading="mapLoading">
        <div id="route-map" style="width:100%;height:400px;"></div>
        <div class="map-placeholder" v-if="!mapLoaded">正在加载地图...</div>
      </div>

      <!-- 路线摘要卡片 -->
      <div class="route-summary-card" v-if="routeDetail">
        <h3>📊 {{ routeSummary }}</h3>
        <div class="route-stats">
          <div class="route-stat">
            <div class="stat-icon">📏</div>
            <div class="stat-info">
              <span class="stat-value">{{ routeDistance }}</span>
              <span class="stat-label">总路程</span>
            </div>
          </div>
          <div class="route-stat">
            <div class="stat-icon">⏱️</div>
            <div class="stat-info">
              <span class="stat-value">{{ routeTime }}</span>
              <span class="stat-label">预计用时</span>
            </div>
          </div>
          <div class="route-stat">
            <div class="stat-icon">💰</div>
            <div class="stat-info">
              <span class="stat-value">{{ routeToll }}</span>
              <span class="stat-label">高速路费</span>
            </div>
          </div>
          <div class="route-stat">
            <div class="stat-icon">⛽</div>
            <div class="stat-info">
              <span class="stat-value">{{ fuelCost }}</span>
              <span class="stat-label">预估油费</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 详细步骤 -->
      <div class="route-steps" v-if="routeSteps.length > 0">
        <h3>📍 详细步骤</h3>
        <el-timeline>
          <el-timeline-item
            v-for="(step, idx) in routeSteps"
            :key="idx"
            :timestamp="`步骤${idx+1}`"
            placement="top"
          >
            <div class="step-card">
              <div class="step-title">{{ step.instruction }}</div>
              <div class="step-detail" v-if="step.distance || step.duration">
                距离：{{ formatDistance(step.distance) }} | 用时：{{ formatDuration(step.duration) }}
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>

      <div class="empty-hint" v-if="!routeDetail && !loading">
        <el-empty description="请输入出发地和目的地，然后点击“规划路线”" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { planRoute as apiPlanRoute } from '@/api/route'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()

const origin = ref('成都市')
const destination = ref('')
const days = ref(3)
const budget = ref(2000)
const preference = ref(['natural'])
const loading = ref(false)
const mapLoading = ref(false)
const mapLoaded = ref(false)

const routeDetail = ref(null)
const routeSummary = ref('')
const routeDistance = ref('')
const routeTime = ref('')
const routeToll = ref('')
const fuelCost = ref('')
const routeSteps = ref([])

let mapInstance = null

function initMap() {
  if (window.AMap) {
    mapInstance = new AMap.Map('route-map', {
      zoom: 8,
      center: [104.0668, 30.5728]
    })
    mapLoaded.value = true
  } else {
    mapLoading.value = true
    const script = document.createElement('script')
    script.src = 'https://webapi.amap.com/maps?v=2.0&key=YOUR_AMAP_KEY&callback=onAMapLoaded'
    window.onAMapLoaded = () => {
      mapInstance = new AMap.Map('route-map', {
        zoom: 8,
        center: [104.0668, 30.5728]
      })
      mapLoaded.value = true
      mapLoading.value = false
    }
    document.head.appendChild(script)
  }
}

async function planRoute() {
  if (!origin.value || !destination.value) {
    ElMessage.warning('请输入出发地和目的地')
    return
  }
  loading.value = true
  try {
    const res = await apiPlanRoute({
      origin: origin.value,
      destination: destination.value,
      days: days.value,
      budget: budget.value,
      preference: preference.value
    })

    const responseData = res.data.data || res.data
    const detail = responseData.routeDetail
    routeDetail.value = detail

    if (detail) {
      routeSummary.value = `从${origin.value}到${destination.value}的路线规划`
      routeDistance.value = `${detail.distanceKm} 公里`
      routeTime.value = detail.durationText
      routeToll.value = `约 ￥${detail.toll}`
      fuelCost.value = `约 ￥${detail.fuelCost}`
      routeSteps.value = detail.steps || []
    } else {
      ElMessage.warning('未获取到路线详情')
    }

    await nextTick()
    if (responseData.sceneries && responseData.sceneries.length > 0) {
      drawMarkersOnMap(responseData.sceneries)
    }
    ElMessage.success('路线规划完成')
  } catch (e) {
    ElMessage.error('路线规划失败：' + (e.message || '请检查网络'))
  }
  loading.value = false
}

function drawMarkersOnMap(sceneries) {
  if (!mapInstance || !sceneries) return
  mapInstance.clearMap()
  const markers = sceneries
    .filter(s => s.longitude && s.latitude)
    .map(s => ({
      position: [s.longitude, s.latitude],
      content: `<div style="background:#e74c3c;color:#fff;padding:4px 8px;border-radius:4px;font-size:12px">${s.name}</div>`
    }))
  markers.forEach(m => {
    new AMap.Marker({
      position: m.position,
      content: m.content,
      map: mapInstance
    })
  })
  if (markers.length >= 2) {
    const path = markers.map(m => m.position)
    new AMap.Polyline({
      path: path,
      strokeColor: '#e74c3c',
      strokeWeight: 4,
      strokeOpacity: 0.8,
      map: mapInstance
    })
    mapInstance.setFitView()
  } else if (markers.length === 1) {
    mapInstance.setCenter(markers[0].position)
  }
}

function formatDistance(meters) {
  if (!meters) return ''
  return (meters / 1000).toFixed(1) + '公里'
}
function formatDuration(seconds) {
  if (!seconds) return ''
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return h > 0 ? `${h}小时${m}分钟` : `${m}分钟`
}

onMounted(() => {
  initMap()
})
</script>

<style scoped>
.route-plan-page { min-height: 100vh; background: #f5f5f5; }
.route-plan-container { max-width: 1000px; margin: 0 auto; padding: 24px; }
.back-btn { margin-bottom: 12px; }
.page-title { font-size: 24px; margin-bottom: 20px; color: #2c3e50; }
.input-section { background: #fff; padding: 20px; border-radius: 12px; margin-bottom: 20px; }
.map-container { background: #fff; border-radius: 12px; overflow: hidden; margin-bottom: 20px; position: relative; }
.map-placeholder { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #999; font-size: 16px; }

.route-summary-card { background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 12px; padding: 24px; color: #fff; margin-bottom: 20px; }
.route-summary-card h3 { margin: 0 0 16px; font-size: 18px; }
.route-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 16px; }
.route-stat { display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.15); padding: 12px; border-radius: 8px; }
.stat-icon { font-size: 28px; }
.stat-info { display: flex; flex-direction: column; }
.stat-value { font-size: 18px; font-weight: bold; }
.stat-label { font-size: 12px; opacity: 0.8; }

.route-steps { background: #fff; border-radius: 12px; padding: 24px; margin-bottom: 20px; }
.route-steps h3 { margin: 0 0 16px; font-size: 18px; color: #2c3e50; }
.step-card { background: #f9f9f9; padding: 12px 16px; border-radius: 8px; }
.step-title { font-size: 14px; color: #333; margin-bottom: 4px; }
.step-detail { font-size: 12px; color: #999; }

.empty-hint { padding: 40px; }
</style>
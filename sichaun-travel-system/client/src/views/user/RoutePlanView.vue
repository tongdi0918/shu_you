<template>
  <div class="route-plan-page">
    <!-- 地图容器 -->
    <div id="amap-container" ref="mapContainer" class="map-container">
      <div v-if="mapLoading" class="map-loading">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>正在加载地图...</span>
      </div>
    </div>

    <!-- 路线规划表单 -->
    <div class="plan-panel">
      <div class="panel-header">
        <el-button text @click="$router.push('/')">返回首页</el-button>
        <h1>🗺️ 路程规划</h1>
      </div>

      <el-form :model="form" label-width="80px" class="plan-form">
        <el-form-item label="出发地">
          <el-input 
            v-model="form.origin" 
            placeholder="请输入出发地（如：成都市）"
            clearable
          />
        </el-form-item>
        <el-form-item label="目的地">
          <el-input 
            v-model="form.destination" 
            placeholder="请输入目的地（如：峨眉山市）"
            clearable
          />
        </el-form-item>
        <el-form-item label="出行天数">
          <el-input-number v-model="form.days" :min="1" :max="30" />
        </el-form-item>
        <el-form-item label="预算">
          <el-input-number 
            v-model="form.budget" 
            :min="100" 
            :step="100" 
            :max="50000"
            placeholder="元"
          />
        </el-form-item>
        <el-form-item label="偏好">
          <el-select v-model="form.preference" multiple placeholder="选择偏好类型">
            <el-option label="自然风光" value="natural" />
            <el-option label="历史文化" value="culture" />
            <el-option label="美食之旅" value="food" />
            <el-option label="休闲度假" value="relax" />
            <el-option label="探险户外" value="adventure" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button 
            type="primary" 
            :loading="planLoading"
            @click="handlePlan"
            class="plan-btn"
          >
            🚗 规划路线
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 路线详情（规划成功后显示） -->
      <div v-if="routeDetail" class="route-detail">
        <h3>📊 {{ routeSummary }}</h3>
        <div class="detail-stats">
          <div class="stat-item">
            <span class="stat-icon">🛣️</span>
            <span class="stat-label">总路程</span>
            <span class="stat-value">{{ routeDetail.distanceKm }} 公里</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">⏱️</span>
            <span class="stat-label">预计用时</span>
            <span class="stat-value">{{ routeDetail.durationText }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">💰</span>
            <span class="stat-label">高速路费</span>
            <span class="stat-value">¥{{ routeDetail.toll }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">⛽</span>
            <span class="stat-label">预估油费</span>
            <span class="stat-value">¥{{ routeDetail.fuelCost }}</span>
          </div>
        </div>

        <!-- 详细步骤 -->
        <h3>📝 详细步骤</h3>
        <div class="steps-list">
          <div 
            v-for="(step, idx) in routeDetail.steps" 
            :key="idx"
            class="step-item"
          >
            <div class="step-number">{{ idx + 1 }}</div>
            <div class="step-content">
              <p class="step-instruction" v-html="step.instruction"></p>
              <p class="step-info">
                距离：{{ formatDistance(step.distance) }} | 
                用时：{{ formatDuration(step.duration) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { planRoute } from '@/api/route'

// 高德地图 Key
const AMAP_KEY = '68ff2afb0b6d70f0a6970b71737729a6'
const AMAP_SECURITY_CODE = '2a3eb8a9e18f098ec82ab143abf3e928'

const mapContainer = ref(null)
const mapLoading = ref(true)
const planLoading = ref(false)
let mapInstance = null
let drivingPlugin = null

const form = reactive({
  origin: '',
  destination: '',
  days: 3,
  budget: 2000,
  preference: []
})

const routeDetail = ref(null)
const routeSummary = ref('')

// 初始化高德地图
async function initMap() {
  // 动态加载高德 JSAPI
  if (window.AMap) {
    createMap()
    return
  }

  const securityJsCode = AMAP_SECURITY_CODE || ''
  const script = document.createElement('script')
  script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}&securityJsCode=${securityJsCode}&plugin=AMap.Driving,AMap.Geocoder`
  script.onload = () => {
    createMap()
  }
  script.onerror = () => {
    mapLoading.value = false
    ElMessage.error('地图加载失败，请检查网络或API Key配置')
  }
  document.head.appendChild(script)
}

function createMap() {
  if (!mapContainer.value) return
  
  mapInstance = new window.AMap.Map(mapContainer.value, {
    zoom: 10,
    center: [104.065735, 30.659462], // 成都市中心
    viewMode: '2D'
  })

  // 添加插件
  window.AMap.plugin(['AMap.Driving', 'AMap.Geocoder'], () => {
    drivingPlugin = new window.AMap.Driving({
      map: mapInstance,
      panel: null, // 不使用内置面板
      autoFitView: true
    })
    mapLoading.value = false
  })
}

// 规划路线
async function handlePlan() {
  if (!form.origin.trim() || !form.destination.trim()) {
    ElMessage.warning('请填写出发地和目的地')
    return
  }

  planLoading.value = true
  try {
    // 调用后端接口获取路线数据
    const res = await planRoute({
      origin: form.origin,
      destination: form.destination,
      days: form.days,
      budget: form.budget,
      preference: form.preference
    })

    if (res.code === 200 && res.data) {
      routeDetail.value = res.data.routeDetail
      routeSummary.value = `从 ${form.origin} 到 ${form.destination}`

      // 在地图上绘制路线
      if (drivingPlugin && mapInstance) {
        // 使用高德驾车路线规划
        drivingPlugin.search(
          form.origin,
          form.destination,
          { strategy: 0 },
          (status, result) => {
            if (status === 'complete') {
              ElMessage.success('路线规划成功')
            } else {
              // 高德规划失败，使用坐标手动绘制
              drawRouteFromCoordinates(res.data)
              ElMessage.warning('线上路线规划失败，已展示预估路线')
            }
          }
        )
      }
    }
  } catch (e) {
    ElMessage.error('路线规划失败：' + (e.message || '未知错误'))
  } finally {
    planLoading.value = false
  }
}

// 手动绘制路线（高德API调用失败时的备选方案）
function drawRouteFromCoordinates(data) {
  // 清理已有覆盖物
  mapInstance.clearMap()

  // 使用后端返回的步骤数据绘制折线
  const path = data.routeDetail.steps.map((step, idx) => {
    // 简化处理：生成大致坐标点
    const baseLng = 104.065735 + idx * 0.5
    const baseLat = 30.659462 + idx * 0.3
    return [baseLng, baseLat]
  })

  // 绘制路线
  if (path.length >= 2) {
    const polyline = new window.AMap.Polyline({
      path: path,
      strokeColor: '#3366FF',
      strokeWeight: 6,
      strokeOpacity: 0.8,
      lineJoin: 'round'
    })
    mapInstance.add(polyline)
    mapInstance.setFitView()
  }

  // 添加起终点标记
  const startMarker = new window.AMap.Marker({
    position: path[0],
    title: form.origin,
    label: { content: '起', offset: { x: 0, y: -20 } }
  })
  const endMarker = new window.AMap.Marker({
    position: path[path.length - 1],
    title: form.destination,
    label: { content: '终', offset: { x: 0, y: -20 } }
  })
  mapInstance.add([startMarker, endMarker])
}

// 格式化距离
function formatDistance(meters) {
  if (!meters) return '0米'
  if (meters >= 1000) {
    return (meters / 1000).toFixed(1) + '公里'
  }
  return meters + '米'
}

// 格式化时长
function formatDuration(seconds) {
  if (!seconds) return '0分钟'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}小时${minutes}分钟`
  return `${minutes}分钟`
}

onMounted(() => {
  nextTick(() => {
    initMap()
  })
})
</script>

<style scoped>
.route-plan-page {
  display: flex;
  height: calc(100vh - 60px);
  background: #f5f7fa;
}

.map-container {
  flex: 1;
  position: relative;
  min-height: 500px;
}

.map-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255,255,255,0.95);
  padding: 20px 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1rem;
  color: #666;
  z-index: 10;
}

.plan-panel {
  width: 400px;
  background: #fff;
  padding: 24px;
  overflow-y: auto;
  box-shadow: -2px 0 12px rgba(0,0,0,0.06);
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.panel-header h1 {
  font-size: 1.4rem;
  margin: 0;
  color: #2c3e50;
}

.plan-form {
  margin-bottom: 24px;
}

.plan-btn {
  width: 100%;
  font-size: 1rem;
}

.route-detail {
  border-top: 1px solid #ebeef5;
  padding-top: 20px;
}

.route-detail h3 {
  font-size: 1.1rem;
  color: #2c3e50;
  margin-bottom: 16px;
}

.detail-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
}

.stat-item {
  background: #f8f9fc;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
}

.stat-icon {
  font-size: 1.5rem;
  display: block;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.8rem;
  color: #999;
  display: block;
}

.stat-value {
  font-size: 0.95rem;
  font-weight: bold;
  color: #333;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #f8f9fc;
  border-radius: 8px;
}

.step-number {
  width: 28px;
  height: 28px;
  background: #667eea;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-instruction {
  margin: 0 0 4px 0;
  font-size: 0.9rem;
  color: #333;
}

.step-info {
  margin: 0;
  font-size: 0.8rem;
  color: #999;
}
</style>
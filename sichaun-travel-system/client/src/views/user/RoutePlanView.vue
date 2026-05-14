<template>
  <div class="route-plan-page">
    <!-- 顶部标题栏 -->
    <header class="page-header">
      <el-button type="default" @click="goBack" :icon="Back">
        返回首页
      </el-button>
      <h1>🗺️ 路程规划</h1>
      <div class="spacer"></div>
    </header>

    <!-- 搜索面板 -->
    <div class="search-panel">
      <el-form :inline="true" class="route-form">
        <el-form-item label="出发地">
          <el-input
            v-model="origin"
            placeholder="请输入出发地"
            clearable
            style="width: 220px"
            @keyup.enter="searchRoute"
          />
        </el-form-item>
        <el-form-item label="目的地">
          <el-input
            v-model="destination"
            placeholder="请输入目的地"
            clearable
            style="width: 220px"
            @keyup.enter="searchRoute"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchRoute" :loading="loading">
            <el-icon><Search /></el-icon> 规划路线
          </el-button>
          <el-button @click="locateAndSetOrigin" :loading="locating">
            <el-icon><Aim /></el-icon> 我的位置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 地图和路线信息容器 -->
    <div class="main-content">
      <!-- 地图容器 -->
      <div class="map-wrapper">
        <div id="amap-container" ref="mapContainer" class="map-box"></div>
        <div v-if="mapLoading" class="map-loading-mask">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>正在加载地图...</span>
        </div>
      </div>

      <!-- 路线详细信息 -->
      <div class="route-info-panel" v-if="routeSteps.length > 0 || routeSummary">
        <h2>{{ routeSummary }}</h2>
        <p><strong>总路程：</strong>{{ routeDistance }}</p>
        <p><strong>预计用时：</strong>{{ routeTime }}</p>
        <h3 style="margin-top: 16px;">详细步骤：</h3>
        <ul class="route-steps">
          <li v-for="(step, index) in routeSteps" :key="index" class="step-item">
            {{ step.instruction }}
          </li>
        </ul>
      </div>
      <div v-else class="route-info-panel empty-tip">
        <p>👆 请输入出发地和目的地，然后点击“规划路线”</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Back, Loading, Search, Aim } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import AMapLoader from '@amap/amap-jsapi-loader'

const router = useRouter()
const mapContainer = ref(null)
const origin = ref('')
const destination = ref('')
const loading = ref(false)
const locating = ref(false)
const mapLoading = ref(true)

// 路线结果
const routeSummary = ref('')
const routeDistance = ref('')
const routeTime = ref('')
const routeSteps = ref([])

let map = null
let driving = null
let geolocation = null // 城市定位插件

// 初始化地图
async function initMap() {
  try {    
    window._AMapSecurityConfig = {
      securityJsCode: '2a3eb8a9e18f098ec82ab143abf3e928' // 替换为你的密钥
    }

    const AMap = await AMapLoader.load({
      key: '68ff2afb0b6d70f0a6970b71737729a6', 
      version: '2.0',
      plugins: [
        'AMap.ToolBar',
        'AMap.Scale',
        'AMap.Driving',
        'AMap.Geolocation', // 用于定位
        'AMap.AutoComplete', // 如果需要输入提示可加
        'AMap.PlaceSearch'
      ]
    })

    map = new AMap.Map('amap-container', {
      viewMode: '3D',
      zoom: 9,
      center: [104.06, 30.67], // 成都
      mapStyle: 'amap://styles/light'
    })

    map.addControl(new AMap.ToolBar())
    map.addControl(new AMap.Scale())

    driving = new AMap.Driving({
      map: map,
      policy: 0, // 速度优先
      panel: null
    })

    // 初始化城市定位（只用于“我的位置”按钮）
    geolocation = new AMap.Geolocation({
      enableHighAccuracy: true,
      timeout: 10000
    })
    map.addControl(geolocation)

    mapLoading.value = false
  } catch (error) {
    console.error('地图初始化失败:', error)
    mapLoading.value = false
    ElMessage.error('地图加载失败，请刷新页面重试')
  }
}

// 执行路线规划
async function searchRoute() {
  // 校验输入
  if (!origin.value.trim()) {
    ElMessage.warning('请输入出发地')
    return
  }
  if (!destination.value.trim()) {
    ElMessage.warning('请输入目的地')
    return
  }

  loading.value = true
  routeSteps.value = []
  routeSummary.value = ''
  routeDistance.value = ''
  routeTime.value = ''

  // 使用高德驾车规划，输入为地点关键字
  driving.search(
    [
      { keyword: origin.value.trim(), city: '全国' },
      { keyword: destination.value.trim(), city: '全国' }
    ],
    (status, result) => {
      loading.value = false
      if (status === 'complete') {
        const route = result.routes[0]
        if (!route) {
          ElMessage.error('未找到合适的路线，请更换起终点')
          return
        }
        routeSummary.value = `${origin.value} → ${destination.value}`
        routeDistance.value = `${(route.distance / 1000).toFixed(1)}公里`
        routeTime.value = `${Math.round(route.time / 60)}分钟`
        routeSteps.value = route.steps.map((step, index) => ({
          instruction: `${index + 1}. ${step.instruction}`
        }))
      } else {
        ElMessage.error('路线规划失败，请稍后重试')
      }
    }
  )
}

// 使用定位填充出发地
function locateAndSetOrigin() {
  if (!geolocation) {
    ElMessage.warning('定位功能未初始化')
    return
  }
  locating.value = true
  geolocation.getCurrentPosition((status, result) => {
    locating.value = false
    if (status === 'complete') {
      const { position, addressComponent } = result
      const province = addressComponent.province || ''
      const city = addressComponent.city || addressComponent.district || ''
      const street = addressComponent.street || addressComponent.streetNumber || ''
      const formattedAddress = `${province}${city}${street}`
      origin.value = formattedAddress || result.formattedAddress || `${position.lng},${position.lat}`
      ElMessage.success('已获取当前位置')
    } else {
      ElMessage.error('定位失败，请手动输入出发地')
    }
  })
}

function goBack() {
  router.push('/')
}

onMounted(async () => {
  await nextTick()
  await initMap()
})
</script>

<style scoped>
.route-plan-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
}

.page-header {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.page-header h1 {
  flex: 1;
  text-align: center;
  margin: 0;
  font-size: 1.3rem;
  color: #2e7d32;
}

.spacer {
  width: 100px;
}

.search-panel {
  background: white;
  padding: 12px 24px;
  margin: 16px 24px 0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: center;
}

.route-form {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.map-wrapper {
  position: relative;
  width: 100%;
  height: 400px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.map-box {
  width: 100%;
  height: 100%;
}

.map-loading-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  color: #666;
}

.route-info-panel {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.route-info-panel h2 {
  margin: 0 0 12px 0;
  color: #2e7d32;
  font-size: 1.2rem;
}

.route-info-panel p {
  margin: 6px 0;
  color: #555;
}

.route-steps {
  list-style: none;
  padding: 0;
  max-height: 300px;
  overflow-y: auto;
}

.step-item {
  padding: 8px 12px;
  margin-bottom: 6px;
  background: #f5f5f5;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #333;
  border-left: 3px solid #4caf50;
}

.empty-tip {
  text-align: center;
  color: #999;
  font-size: 1rem;
}
</style>
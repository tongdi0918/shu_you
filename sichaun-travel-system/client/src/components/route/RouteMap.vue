<template>
  <div class="route-map-container">
    <div id="gaode-map" class="map-box"></div>
    <div class="route-control">
      <h3>🗺️ 智能路线规划</h3>
      <el-form :model="form" label-width="80px" size="small">
        <el-form-item label="出发城市"><el-input v-model="form.origin" placeholder="如：成都"/></el-form-item>
        <el-form-item label="行程天数"><el-input-number v-model="form.days" :min="1" :max="15"/></el-form-item>
        <el-form-item label="预算(元)"><el-input-number v-model="form.budget" :min="500" :max="50000" :step="500"/></el-form-item>
        <el-form-item label="偏好类型">
          <el-select v-model="form.preference" placeholder="请选择">
            <el-option label="自然风光" value="nature"/>
            <el-option label="人文历史" value="culture"/>
            <el-option label="美食之旅" value="food"/>
            <el-option label="综合推荐" value="all"/>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="smartPlan" :loading="planning">
            ✨ 智能规划路线
          </el-button>
        </el-form-item>
      </el-form>

      <div v-if="planResult.length > 0" class="plan-result">
        <div v-for="(day, idx) in planResult" :key="idx" class="day-card">
          <h4>📅 第 {{ day.day }} 天</h4>
          <div v-for="(s, sIdx) in day.spots" :key="sIdx" class="spot-item">
            <span>{{ s.name }}</span>
            <span class="distance">{{ day.distance }}km</span>
          </div>
        </div>
      </div>

      <div class="ctrip-link">
        如需预订车票与酒店，请前往：
        <a href="https://www.ctrip.com" target="_blank" class="ctrip-btn">🏨 前往携程预订</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import AMapLoader from '@amap/amap-jsapi-loader'

const AMAP_KEY = '68ff2afb0b6d70f0a6970b71737729a6'
let map = null
let AMapInstance = null

const form = ref({
  origin: '',
  days: 3,
  budget: 3000,
  preference: 'all'
})
const planning = ref(false)
const planResult = ref([])

async function loadAMap() {
  if (AMapInstance) return AMapInstance
  AMapInstance = await AMapLoader.load({
    key: AMAP_KEY,
    version: '2.0',
    plugins: ['AMap.Driving', 'AMap.Geocoder', 'AMap.Scale']
  })
  return AMapInstance
}

async function initMap() {
  try {
    await loadAMap()
    map = new AMapInstance.Map('gaode-map', {
      zoom: 8,
      center: [104.065735, 30.659462],
      viewMode: '3D'
    })
    map.addControl(new AMapInstance.Scale())
  } catch (e) {
    console.error('RouteMap 地图初始化失败：', e)
  }
}

async function smartPlan() {
  planning.value = true
  try {
    // 这里可以调用您的后端 API 获取规划数据，示例保持原有逻辑
    // 如果内部需要用地理编码，请使用：
    // const geocoder = new AMapInstance.Geocoder()
    // const result = await geocoder.getLocation('成都')
    // ...
    setTimeout(() => {
      planResult.value = [
        { day: 1, spots: [{ name: '宽窄巷子' }, { name: '锦里' }], distance: 15 },
        { day: 2, spots: [{ name: '都江堰' }, { name: '青城山' }], distance: 80 },
        { day: 3, spots: [{ name: '峨眉山' }], distance: 150 }
      ]
      planning.value = false
    }, 1500)
  } catch (error) {
    console.error('智能规划失败：', error)
    planning.value = false
  }
}

onMounted(() => { initMap() })
onBeforeUnmount(() => { if (map) map.destroy() })
</script>

<style scoped>
.route-map-container {
  display: flex;
  height: 100%;
}
.map-box {
  flex: 1;
  min-height: 400px;
}
.route-control {
  width: 360px;
  padding: 16px;
  background: #fff;
  overflow-y: auto;
  box-shadow: -2px 0 12px rgba(0,0,0,0.1);
}
.route-control h3 {
  margin: 0 0 16px 0;
}
.plan-result {
  margin-top: 16px;
}
.day-card {
  margin-bottom: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}
.day-card h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
}
.spot-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 13px;
}
.distance {
  color: #999;
  font-size: 12px;
}
.ctrip-link {
  margin-top: 20px;
  padding: 12px;
  text-align: center;
  font-size: 13px;
  color: #666;
  border-top: 1px solid #eee;
}
.ctrip-btn {
  display: inline-block;
  margin-top: 8px;
  padding: 8px 16px;
  background: #1890ff;
  color: #fff;
  border-radius: 6px;
  text-decoration: none;
}
</style>
<!-- client/src/components/route/RouteMap.vue -->
<template>
  <div class="route-map-container">
    <div id="gaode-map" class="map-box"></div>
    <div class="route-control">
      <h3>🚗 智能路线规划</h3>
      <el-form :model="form" label-width="80px" size="small">
        <el-form-item label="出发城市"><el-input v-model="form.origin" placeholder="如：成都"/></el-form-item>
        <el-form-item label="行程天数"><el-input-number v-model="form.days" :min="1" :max="15"/></el-form-item>
        <el-form-item label="预算(元)"><el-input-number v-model="form.budget" :min="500" :max="50000" :step="500"/></el-form-item>
        <el-form-item label="偏好类型">
          <el-select v-model="form.preference" multiple>
            <el-option label="自然风光" value="natural"/>
            <el-option label="历史文化" value="culture"/>
            <el-option label="美食之旅" value="food"/>
            <el-option label="休闲度假" value="relax"/>
            <el-option label="探险户外" value="adventure"/>
          </el-select>
        </el-form-item>
        <el-button type="primary" @click="planRoute" :loading="loading">✨ 智能规划路线</el-button>
      </el-form>
      <!-- 路线详情 -->
      <div v-if="routes.length" class="route-result">
        <div v-for="(day, i) in routes" :key="i" class="day-card">
          <h4>📅 第 {{ day.day }} 天</h4>
          <p v-for="s in day.sceneries" :key="s.id">{{ s.name }}</p>
          <span class="distance">{{ day.distance }}km</span>
        </div>
        <!-- 携程预订入口 -->
        <div class="ctrip-entry">
          <p>如需预订车票与酒店，请前往：</p>
          <a href="https://www.ctrip.com/" target="_blank" rel="noopener">
            <el-button type="warning">🔗 前往携程预订</el-button>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import AMapLoader from '@amap/amap-jsapi-loader';
import { planRoute as apiPlanRoute } from '../../api/route';

const form = ref({ origin: '成都', days: 3, budget: 3000, preference: ['natural'] });
const loading = ref(false);
const routes = ref([]);
let map = null, driving = null;

onMounted(async () => {
    window._AMapSecurityConfig = { securityJsCode: 'your_security_code' };
    await AMapLoader.load({
        key: 'your_gaode_key', version: '2.0',
        plugins: ['AMap.ToolBar', 'AMap.Scale', 'AMap.Driving']
    });
    map = new AMap.Map('gaode-map', { viewMode: '3D', zoom: 12, center: [104.06, 30.57] });
    map.addControl(new AMap.ToolBar());
    map.addControl(new AMap.Scale());
    driving = new AMap.Driving({ map, policy: AMap.DrivingPolicy.LEAST_TIME });
});

async function planRoute() {
    loading.value = true;
    try {
        const res = await apiPlanRoute(form.value);
        routes.value = res.data || [];
        // 在地图上绘制路线
        if (routes.value.length && routes.value[0].route) {
            driving.search(
                routes.value[0].route.origin,
                routes.value[0].route.destination,
                { waypoints: routes.value[0].route.waypoints || [] }
            );
        }
    } catch(e) { ElMessage.error('路线规划失败'); }
    loading.value = false;
}
</script>

<style scoped>
.route-map-container { display: flex; height: 600px; border-radius: 12px; overflow: hidden; }
.map-box { flex: 1; min-width: 0; }
.route-control { width: 380px; padding: 20px; background: #f8f9fa; overflow-y: auto; }
.day-card { background: #fff; border-radius: 8px; padding: 12px; margin-bottom: 10px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
</style>
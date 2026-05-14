<!-- client/src/views/user/RoutePlanView.vue -->
<template>
  <div class="page-container">
    <div class="page-header">
      <h2>🚗 智能路线规划</h2>
      <p>基于高德地图，为您规划最优的四川旅行路线</p>
    </div>
    <RouteMap />
  </div>
</template>

<script setup>
import RouteMap from '../../components/route/RouteMap.vue';
</script>

<style scoped>
.page-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 30px 20px;
}
.page-header {
    text-align: center;
    margin-bottom: 30px;
}
.page-header h2 { margin: 0 0 8px; font-size: 26px; color: #2c3e50; }
.page-header p { color: #909399; margin: 0; }
</style>
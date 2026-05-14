<!-- client/src/components/admin/DataManager.vue -->
<template>
  <div class="data-manager">
    <h3>⚙️ 数据管理中心</h3>
    
    <el-tabs v-model="activeTab">
      <!-- 景区数据管理 -->
      <el-tab-pane label="🏔️ 景区管理" name="scenic">
        <ScenicManager />
      </el-tab-pane>

      <!-- 美食数据管理 -->
      <el-tab-pane label="🍜 美食管理" name="food">
        <FoodManager />
      </el-tab-pane>

      <!-- 用户行为数据导出 -->
      <el-tab-pane label="📊 行为数据" name="behavior">
        <div class="behavior-section">
          <p>用户行为数据用于训练推荐模型，当前共 <strong>{{ behaviorCount }}</strong> 条记录。</p>
          <el-button type="primary" @click="exportData">导出 CSV</el-button>
          <el-button type="danger" plain @click="clearBehavior">清空行为数据</el-button>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ScenicManager from '../../views/admin/ScenicManager.vue';
import FoodManager from '../../views/admin/FoodManager.vue';

const activeTab = ref('scenic');
const behaviorCount = ref(1500); // 可从API获取

function exportData() {
  alert('模拟导出行为数据...');
}

function clearBehavior() {
  if (confirm('确定清空所有用户行为数据吗？此操作不可恢复！')) {
    alert('行为数据已清空（模拟）');
  }
}
</script>

<style scoped>
.data-manager { padding: 20px; }
h3 { margin-bottom: 20px; color: #2c3e50; }
.behavior-section { padding: 20px 0; }
</style>
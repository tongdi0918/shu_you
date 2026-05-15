<!-- client/src/views/user/HistoryView.vue -->
<template>
  <div class="history-container">
    <AppHeader />
    <div class="content">
      <h2>浏览历史</h2>
      <el-table :data="history" v-loading="loading" empty-text="暂无浏览记录">
        <el-table-column prop="item_name" label="名称" />
        <el-table-column prop="item_type" label="类型" width="80">
          <template #default="{ row }">
            <el-tag :type="row.item_type === 'scenery' ? 'success' : 'warning'" size="small">
              {{ row.item_type === 'scenery' ? '景区' : '美食' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="item_city" label="城市" width="120" />
        <el-table-column prop="view_time" label="浏览时间" width="180">
          <template #default="{ row }">
            {{ new Date(row.view_time).toLocaleString() }}
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getBrowseHistory } from '../../api/user';
import { ElMessage } from 'element-plus';
import AppHeader from '../../components/common/AppHeader.vue';

const history = ref([]);
const loading = ref(false);

const loadData = async () => {
  loading.value = true;
  try {
    const res = await getBrowseHistory();
    history.value = res.data || [];
  } catch (e) {
    ElMessage.error('加载浏览历史失败');
  } finally {
    loading.value = false;
  }
};

onMounted(loadData);
</script>

<style scoped>
.history-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.content {
  max-width: 1000px;
  margin: 40px auto;
  padding: 0 20px;
}

.content h2 {
  margin-bottom: 20px;
}
</style>
<!-- sichaun-travel-system/client/src/views/user/HistoryView.vue -->
<template>
  <div class="history-page">
    <div class="page-header">
      <h2>📜 浏览历史</h2>
    </div>

    <div v-if="loading" class="loading-container">
      <el-icon class="is-loading" :size="32"><Loading /></el-icon>
      <p>加载中...</p>
    </div>

    <el-empty v-else-if="historyList.length === 0" description="暂无浏览记录，快去探索吧~" />

    <div v-else class="history-list">
      <div
        class="history-item"
        v-for="item in historyList"
        :key="item.id"
        @click="goDetail(item)"
      >
        <img :src="item.item_image || '/placeholder.jpg'" class="item-img" />
        <div class="item-info">
          <div class="item-header">
            <h3>{{ item.item_name }}</h3>
            <el-tag :type="item.item_type === 'scenery' ? 'success' : 'danger'" size="small">
              {{ item.item_type === 'scenery' ? '景区' : '美食' }}
            </el-tag>
          </div>
          <p class="item-time">{{ formatTime(item.created_at) }}</p>
        </div>
        <el-icon><ArrowRight /></el-icon>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const router = useRouter();
const historyList = ref([]);
const loading = ref(true);

const fetchHistory = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    ElMessage.warning('请先登录');
    router.push('/login');
    return;
  }
  try {
    const res = await fetch('/api/user/history', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.code === 200) {
      historyList.value = data.data || [];
    } else {
      ElMessage.error(data.msg || '获取浏览历史失败');
    }
  } catch (e) {
    ElMessage.error('网络错误');
  } finally {
    loading.value = false;
  }
};

const goDetail = (item) => {
  if (item.item_type === 'scenery') {
    router.push(`/scenic/${item.item_id}`);
  } else {
    router.push(`/food/${item.item_id}`);
  }
};

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const d = new Date(timeStr);
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(fetchHistory);
</script>

<style scoped>
.history-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 20px;
}

.page-header {
  background: linear-gradient(135deg, #409EFF, #67C23A);
  color: white;
  padding: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 0;
  color: #909399;
}

.history-list {
  padding: 12px;
}

.history-item {
  background: white;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  cursor: pointer;
}

.item-img {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.item-header h3 {
  margin: 0;
  font-size: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-time {
  font-size: 12px;
  color: #909399;
}
</style>
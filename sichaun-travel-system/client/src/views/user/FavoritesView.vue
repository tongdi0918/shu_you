<!-- client/src/views/user/FavoritesView.vue -->
<template>
  <div class="favorites-container">
    <AppHeader />
    <div class="content">
      <h2>我的收藏</h2>
      <el-tabs v-model="activeTab" @tab-change="loadData">
        <el-tab-pane label="全部" name="all" />
        <el-tab-pane label="景区" name="scenery" />
        <el-tab-pane label="美食" name="food" />
      </el-tabs>
      <el-table :data="favorites" v-loading="loading" empty-text="暂无收藏">
        <el-table-column prop="item_name" label="名称" />
        <el-table-column prop="item_type" label="类型" width="80">
          <template #default="{ row }">
            <el-tag :type="row.item_type === 'scenery' ? 'success' : 'warning'" size="small">
              {{ row.item_type === 'scenery' ? '景区' : '美食' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="item_city" label="城市" width="120" />
        <el-table-column prop="item_rating" label="评分" width="80" />
        <el-table-column prop="fav_time" label="收藏时间" width="180">
          <template #default="{ row }">
            {{ new Date(row.fav_time).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button type="danger" size="small" @click="handleDelete(row)">取消收藏</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getFavorites, deleteFavorite } from '../../api/user';
import { ElMessage, ElMessageBox } from 'element-plus';
import AppHeader from '../../components/common/AppHeader.vue';

const favorites = ref([]);
const loading = ref(false);
const activeTab = ref('all');

const loadData = async () => {
  loading.value = true;
  try {
    const params = activeTab.value !== 'all' ? { type: activeTab.value } : {};
    const res = await getFavorites(params);
    favorites.value = res.data || [];
  } catch (e) {
    ElMessage.error('加载收藏失败');
  } finally {
    loading.value = false;
  }
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定取消收藏？', '提示', { type: 'warning' });
    await deleteFavorite(row.fav_id);
    ElMessage.success('已取消收藏');
    loadData();
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('操作失败');
  }
};

onMounted(loadData);
</script>

<style scoped>
.favorites-container {
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
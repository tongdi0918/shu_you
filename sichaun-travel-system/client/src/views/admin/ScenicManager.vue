<!-- client/src/views/admin/ScenicManager.vue -->
<template>
  <div class="scenic-manager">
    <el-container>
      <el-header class="admin-header">
        <h2>🏔️ 蜀游记管理后台</h2>
        <div class="header-right">
          <span>欢迎，{{ userStore.username }}</span>
          <el-button type="danger" size="small" @click="handleLogout">退出登录</el-button>
        </div>
      </el-header>
      <el-container>
        <el-aside width="200px" class="admin-aside">
          <el-menu router :default-active="$route.path">
            <el-menu-item index="/admin/dashboard">
              <el-icon><DataAnalysis /></el-icon><span>数据概览</span>
            </el-menu-item>
            <el-menu-item index="/admin/scenic">
              <el-icon><Picture /></el-icon><span>景区管理</span>
            </el-menu-item>
            <el-menu-item index="/admin/food">
              <el-icon><DishDot /></el-icon><span>美食管理</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <el-main>
          <div class="toolbar">
            <h3>景区数据管理</h3>
            <el-button type="primary" @click="openDialog()">
              <el-icon><Plus /></el-icon> 新增景区
            </el-button>
          </div>
          <el-table :data="sceneries" v-loading="loading" border stripe>
            <el-table-column prop="id" label="ID" width="60" />
            <el-table-column prop="name" label="名称" width="180" />
            <el-table-column prop="city" label="城市" width="120" />
            <el-table-column prop="level" label="等级" width="70" />
            <el-table-column prop="ticket_price" label="门票(¥)" width="100" />
            <el-table-column prop="rating" label="评分" width="80" />
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button size="small" @click="openDialog(row)">编辑</el-button>
                <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 新增/编辑弹窗 -->
          <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑景区' : '新增景区'" width="600px">
            <el-form :model="form" label-width="100px">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="景区名称">
                    <el-input v-model="form.name" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="所在城市">
                    <el-input v-model="form.city" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="景区等级">
                    <el-select v-model="form.level" style="width: 100%">
                      <el-option v-for="l in ['5A','4A','3A']" :key="l" :label="l" :value="l" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="门票价格">
                    <el-input-number v-model="form.ticket_price" :min="0" :precision="2" style="width: 100%" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-form-item label="描述">
                <el-input v-model="form.description" type="textarea" :rows="3" />
              </el-form-item>
              <el-form-item label="图片URL">
                <el-input v-model="form.image_url" />
              </el-form-item>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="经度">
                    <el-input-number v-model="form.longitude" :precision="7" style="width: 100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="纬度">
                    <el-input-number v-model="form.latitude" :precision="7" style="width: 100%" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-form-item label="标签">
                <el-input v-model="form.tags" placeholder="逗号分隔，如：自然风光,世界遗产" />
              </el-form-item>
              <el-form-item label="评分">
                <el-input-number v-model="form.rating" :min="0" :max="5" :step="0.1" style="width: 100%" />
              </el-form-item>
            </el-form>
            <template #footer>
              <el-button @click="dialogVisible = false">取消</el-button>
              <el-button type="primary" @click="handleSave">保存</el-button>
            </template>
          </el-dialog>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../stores/userStore';
import { getAdminSceneries, createScenic, updateScenic, deleteScenic } from '../../api/admin';
import { ElMessage, ElMessageBox } from 'element-plus';

const router = useRouter();
const userStore = useUserStore();

const sceneries = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);

const form = reactive({
  id: null,
  name: '',
  city: '',
  level: '4A',
  description: '',
  image_url: '',
  longitude: null,
  latitude: null,
  ticket_price: 0,
  opening_hours: '',
  season_best: '',
  tags: '',
  rating: 4.5,
});

const loadData = async () => {
  loading.value = true;
  try {
    const res = await getAdminSceneries();
    sceneries.value = res.data || [];
  } catch (e) {
    ElMessage.error('加载景区数据失败');
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  Object.assign(form, {
    id: null, name: '', city: '', level: '4A', description: '', image_url: '',
    longitude: null, latitude: null, ticket_price: 0, opening_hours: '',
    season_best: '', tags: '', rating: 4.5,
  });
};

const openDialog = (row = null) => {
  resetForm();
  if (row) {
    isEdit.value = true;
    Object.assign(form, row);
  } else {
    isEdit.value = false;
  }
  dialogVisible.value = true;
};

const handleSave = async () => {
  try {
    if (isEdit.value) {
      await updateScenic(form.id, form);
      ElMessage.success('景区更新成功');
    } else {
      await createScenic(form);
      ElMessage.success('景区新增成功');
    }
    dialogVisible.value = false;
    loadData();
  } catch (e) {
    ElMessage.error('操作失败');
  }
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除景区"${row.name}"？`, '警告', { type: 'warning' });
    await deleteScenic(row.id);
    ElMessage.success('景区删除成功');
    loadData();
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('删除失败');
  }
};

const handleLogout = () => {
  userStore.logout();
  router.push('/admin');
};

onMounted(loadData);
</script>

<style scoped>
.scenic-manager {
  min-height: 100vh;
  background: #f5f7fa;
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0 20px;
  height: 60px;
}

.admin-header h2 { margin: 0; font-size: 20px; }

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.admin-aside {
  background: #fff;
  border-right: 1px solid #e4e7ed;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.toolbar h3 { margin: 0; }
</style>
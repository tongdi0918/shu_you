<!-- client/src/views/admin/FoodManager.vue -->
<template>
  <div class="food-manager">
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
            <h3>美食数据管理</h3>
            <el-button type="primary" @click="openDialog()">
              <el-icon><Plus /></el-icon> 新增美食
            </el-button>
          </div>
          <el-table :data="foods" v-loading="loading" border stripe>
            <el-table-column prop="id" label="ID" width="60" />
            <el-table-column prop="name" label="名称" width="180" />
            <el-table-column prop="city" label="城市" width="120" />
            <el-table-column prop="category" label="类别" width="100" />
            <el-table-column prop="avg_price" label="均价(¥)" width="100" />
            <el-table-column prop="rating" label="评分" width="80" />
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button size="small" @click="openDialog(row)">编辑</el-button>
                <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 新增/编辑弹窗 -->
          <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑美食' : '新增美食'" width="600px">
            <el-form :model="form" label-width="100px">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="美食名称">
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
                  <el-form-item label="类别">
                    <el-select v-model="form.category" style="width: 100%">
                      <el-option v-for="c in ['火锅','小吃','面食','川菜','烧烤','甜品']" :key="c" :label="c" :value="c" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="均价">
                    <el-input-number v-model="form.avg_price" :min="0" :precision="2" style="width: 100%" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-form-item label="描述">
                <el-input v-model="form.description" type="textarea" :rows="3" />
              </el-form-item>
              <el-form-item label="图片URL">
                <el-input v-model="form.image_url" />
              </el-form-item>
              <el-form-item label="标签">
                <el-input v-model="form.tags" placeholder="逗号分隔" />
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
import { getAdminFoods, createFood, updateFood, deleteFood } from '../../api/admin';
import { ElMessage, ElMessageBox } from 'element-plus';

const router = useRouter();
const userStore = useUserStore();

const foods = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);

const form = reactive({
  id: null, name: '', city: '', category: '', description: '',
  image_url: '', avg_price: 0, tags: '', rating: 4.5,
});

const loadData = async () => {
  loading.value = true;
  try {
    const res = await getAdminFoods();
    foods.value = res.data || [];
  } catch (e) {
    ElMessage.error('加载美食数据失败');
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  Object.assign(form, {
    id: null, name: '', city: '', category: '', description: '',
    image_url: '', avg_price: 0, tags: '', rating: 4.5,
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
      await updateFood(form.id, form);
      ElMessage.success('美食更新成功');
    } else {
      await createFood(form);
      ElMessage.success('美食新增成功');
    }
    dialogVisible.value = false;
    loadData();
  } catch (e) {
    ElMessage.error('操作失败');
  }
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除美食"${row.name}"？`, '警告', { type: 'warning' });
    await deleteFood(row.id);
    ElMessage.success('美食删除成功');
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
.food-manager {
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
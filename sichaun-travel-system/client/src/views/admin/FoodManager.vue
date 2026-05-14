<!-- client/src/views/admin/FoodManager.vue -->
<template>
  <div class="admin-page">
    <div class="admin-header">
      <h2>🍜 美食数据管理</h2>
      <el-button type="primary" @click="openDialog()">+ 新增美食</el-button>
    </div>

    <el-table :data="foods" stripe style="margin-top:20px">
      <el-table-column prop="id" label="ID" width="60"/>
      <el-table-column prop="name" label="名称" width="150"/>
      <el-table-column prop="city" label="城市" width="100"/>
      <el-table-column prop="category" label="分类" width="100"/>
      <el-table-column prop="avg_price" label="均价(¥)" width="100"/>
      <el-table-column prop="rating" label="评分" width="80"/>
      <el-table-column label="操作" min-width="200">
        <template #default="{ row }">
          <el-button size="small" @click="openDialog(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="isEdit ? '编辑美食' : '新增美食'" v-model="dialogVisible" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="名称">
          <el-input v-model="form.name"/>
        </el-form-item>
        <el-form-item label="城市">
          <el-input v-model="form.city"/>
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.category">
            <el-option label="经典川菜" value="经典川菜"/>
            <el-option label="小吃" value="小吃"/>
            <el-option label="面食" value="面食"/>
            <el-option label="火锅" value="火锅"/>
            <el-option label="特色菜" value="特色菜"/>
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="4"/>
        </el-form-item>
        <el-form-item label="均价">
          <el-input-number v-model="form.avg_price" :min="0"/>
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="form.tags" placeholder="逗号分隔"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getAdminFoods, createFood, updateFood, deleteFood } from '../../api/admin';
import { ElMessage, ElMessageBox } from 'element-plus';

const foods = ref([]);
const dialogVisible = ref(false);
const isEdit = ref(false);
const form = ref({ name: '', city: '', category: '', description: '', avg_price: 0, tags: '' });
let editId = null;

onMounted(async () => {
    const res = await getAdminFoods();
    foods.value = res.data;
});

function openDialog(row) {
    if (row) {
        isEdit.value = true;
        editId = row.id;
        form.value = { ...row };
    } else {
        isEdit.value = false;
        editId = null;
        form.value = { name: '', city: '', category: '', description: '', avg_price: 0, tags: '' };
    }
    dialogVisible.value = true;
}

async function handleSave() {
    if (isEdit.value) {
        await updateFood({ ...form.value, id: editId });
        ElMessage.success('更新成功');
    } else {
        await createFood(form.value);
        ElMessage.success('新增成功');
    }
    dialogVisible.value = false;
    const res = await getAdminFoods();
    foods.value = res.data;
}

async function handleDelete(id) {
    await ElMessageBox.confirm('确定删除该美食吗？', '提示', { type: 'warning' });
    await deleteFood(id);
    ElMessage.success('删除成功');
    const res = await getAdminFoods();
    foods.value = res.data;
}
</script>

<style scoped>
.admin-page {
    padding: 30px;
    background: #f0f2f5;
    min-height: 100vh;
}
.admin-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.admin-header h2 { margin: 0; color: #2c3e50; }
</style>
<!-- client/src/views/admin/ScenicManager.vue -->
<template>
  <div class="admin-page">
    <h2>📋 景区数据管理</h2>
    <el-button type="primary" @click="openDialog()">+ 新增景区</el-button>
    <el-table :data="sceneries" stripe style="margin-top:20px">
      <el-table-column prop="id" label="ID" width="60"/>
      <el-table-column prop="name" label="名称" width="150"/>
      <el-table-column prop="city" label="城市" width="100"/>
      <el-table-column prop="ticket_price" label="门票(¥)" width="100"/>
      <el-table-column prop="rating" label="评分" width="80"/>
      <el-table-column label="操作" min-width="200">
        <template #default="{ row }">
          <el-button size="small" @click="openDialog(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteScenic(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 编辑对话框 -->
    <el-dialog :title="isEdit ? '编辑景区' : '新增景区'" v-model="dialogVisible">
      <el-form :model="form" label-width="100px">
        <el-form-item label="名称"><el-input v-model="form.name"/></el-form-item>
        <el-form-item label="城市"><el-input v-model="form.city"/></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" type="textarea" :rows="4"/></el-form-item>
        <el-form-item label="门票价格"><el-input-number v-model="form.ticket_price"/></el-form-item>
        <el-form-item label="标签"><el-input v-model="form.tags"/></el-form-item>
        <el-form-item label="经纬度">
          <el-input v-model="form.longitude" placeholder="经度" style="width:48%;margin-right:4%"/>
          <el-input v-model="form.latitude" placeholder="纬度" style="width:48%"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="saveScenic">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getSceneries, createScenic, updateScenic, deleteScenic as delScenic } from '../../api/admin';
const sceneries = ref([]);
const dialogVisible = ref(false);
const isEdit = ref(false);
const form = ref({ name:'', city:'', description:'', ticket_price:0, tags:'', longitude:0, latitude:0 });

onMounted(async () => {
    const res = await getSceneries();
    sceneries.value = res.data;
});
function openDialog(row) {
    isEdit.value = !!row;
    form.value = row ? { ...row } : { name:'', city:'', description:'', ticket_price:0, tags:'', longitude:0, latitude:0 };
    dialogVisible.value = true;
}
async function saveScenic() {
    isEdit.value ? await updateScenic(form.value) : await createScenic(form.value);
    dialogVisible.value = false;
    const res = await getSceneries();
    sceneries.value = res.data;
}
async function deleteScenic(id) {
    await delScenic(id);
    const res = await getSceneries();
    sceneries.value = res.data;
}
</script>
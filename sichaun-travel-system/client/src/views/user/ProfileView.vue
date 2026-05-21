<!-- client/src/views/user/ProfileView.vue -->
<template>
  <div class="profile-container">
    <AppHeader />
    <div class="profile-content">
      <el-card class="profile-card">
        <template #header>
          <h3>个人信息</h3>
        </template>
        <el-form :model="form" label-width="80px" v-loading="loading">
          <el-form-item label="用户名">
            <el-input v-model="form.username" disabled />
          </el-form-item>
          <el-form-item label="手机号">
            <el-input v-model="form.phone" placeholder="请输入手机号" />
          </el-form-item>
          <el-form-item label="注册时间">
            <el-input v-model="form.created_at" disabled />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSave">保存修改</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getProfile, updateProfile } from '../../api/user';
import { ElMessage } from 'element-plus';
import AppHeader from '../../components/common/AppHeader.vue';

const router = useRouter();
const loading = ref(false);
const form = reactive({
  username: '',
  phone: '',
  created_at: '',
});

const loadProfile = async () => {
  loading.value = true;
  try {
    const res = await getProfile();
    const data = res.data || res;
    Object.assign(form, {
      username: data.username || '',
      phone: data.phone || '',
      created_at: data.created_at ? new Date(data.created_at).toLocaleString() : '',
    });
  } catch (e) {
    ElMessage.error('加载个人信息失败');
  } finally {
    loading.value = false;
  }
};

const handleSave = async () => {
  try {
    await updateProfile({ phone: form.phone });
    ElMessage.success('个人信息更新成功');
  } catch (e) {
    ElMessage.error('更新失败');
  }
};

onMounted(loadProfile);
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.profile-content {
  max-width: 600px;
  margin: 40px auto;
  padding: 0 20px;
}
</style>
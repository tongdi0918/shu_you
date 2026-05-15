<!-- client/src/views/admin/AdminLogin.vue -->
<template>
  <div class="admin-login-container">
    <el-card class="admin-login-card">
      <h2>🔐 管理员登录</h2>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="0">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="管理员用户名" prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="管理员密码" prefix-icon="Lock" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleLogin" style="width: 100%">
            管理员登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../stores/userStore';
import { ElMessage } from 'element-plus';

const router = useRouter();
const userStore = useUserStore();
const loading = ref(false);

const form = reactive({
  username: '',
  password: '',
});

const rules = {
  username: [{ required: true, message: '请输入管理员用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
};

const handleLogin = async () => {
  loading.value = true;
  const result = await userStore.login(form.username, form.password);
  loading.value = false;
  if (result.success) {
    if (userStore.isAdmin) {
      ElMessage.success('管理员登录成功');
      router.push('/admin/dashboard');
    } else {
      ElMessage.error('非管理员账号，无权访问');
      userStore.logout();
    }
  } else {
    ElMessage.error(result.msg);
  }
};
</script>

<style scoped>
.admin-login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #434343 0%, #000000 100%);
}

.admin-login-card {
  width: 400px;
  padding: 20px;
}

.admin-login-card h2 {
  text-align: center;
  margin-bottom: 24px;
}
</style>
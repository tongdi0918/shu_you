<!-- client/src/views/user/RegisterView.vue -->
<template>
  <div class="register-container">
    <el-card class="register-card">
      <h2>用户注册</h2>
      <p class="subtitle">加入蜀游记，开启智能旅行</p>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="0">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" prefix-icon="Lock" show-password />
        </el-form-item>
        <el-form-item prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号（选填）" prefix-icon="Phone" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleRegister" style="width: 100%">
            注 册
          </el-button>
        </el-form-item>
      </el-form>
      <p class="login-link">
        已有账号？ <router-link to="/login">立即登录</router-link>
      </p>
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
  phone: '',
});

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, min: 6, message: '密码至少6位', trigger: 'blur' }],
};

const handleRegister = async () => {
  loading.value = true;
  const result = await userStore.register(form.username, form.password, form.phone);
  loading.value = false;
  if (result.success) {
    ElMessage.success(result.msg);
    router.push('/login');
  } else {
    ElMessage.error(result.msg);
  }
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 60px);
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.register-card {
  width: 400px;
  padding: 20px;
}

.register-card h2 {
  text-align: center;
  margin-bottom: 8px;
  color: #333;
}

.subtitle {
  text-align: center;
  color: #999;
  margin-bottom: 24px;
  font-size: 14px;
}

.login-link {
  text-align: center;
  font-size: 14px;
  color: #999;
}

.login-link a {
  color: #667eea;
}
</style>
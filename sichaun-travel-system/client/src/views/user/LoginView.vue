<!-- client/src/views/user/LoginView.vue -->
<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2>👤 用户登录</h2>
      <p class="subtitle">登录后获取个性化旅行推荐</p>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="0" size="large">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" prefix-icon="Lock" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" class="submit-btn" @click="handleLogin">
            登 录
          </el-button>
        </el-form-item>
      </el-form>
      <div class="auth-footer">
        还没有账号？<router-link to="/register">立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../stores/userStore';
import { ElMessage } from 'element-plus';

const router = useRouter();
const userStore = useUserStore();

const form = reactive({ username: '', password: '' });
const formRef = ref(null);
const loading = ref(false);

const rules = {
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
};

async function handleLogin() {
    const valid = await formRef.value.validate().catch(() => false);
    if (!valid) return;
    loading.value = true;
    const result = await userStore.login(form.username, form.password);
    loading.value = false;
    if (result.success) {
        ElMessage.success('登录成功');
        router.push('/');
    } else {
        ElMessage.error(result.msg);
    }
}
</script>

<style scoped>
.auth-page {
    min-height: calc(100vh - 64px);
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 40px 20px;
}
.auth-card {
    width: 400px;
    background: #fff;
    border-radius: 16px;
    padding: 40px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.1);
}
.auth-card h2 { margin: 0 0 8px; font-size: 24px; color: #2c3e50; text-align: center; }
.subtitle { text-align: center; color: #909399; font-size: 14px; margin: 0 0 30px; }
.submit-btn { width: 100%; }
.auth-footer { text-align: center; font-size: 14px; color: #909399; }
.auth-footer a { color: #667eea; }
</style>
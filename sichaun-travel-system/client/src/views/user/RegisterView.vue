<!-- client/src/views/user/RegisterView.vue -->
<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2>📝 用户注册</h2>
      <p class="subtitle">加入蜀游记，开启智能旅行</p>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="0" size="large">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" prefix-icon="Phone" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" prefix-icon="Lock" show-password />
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" placeholder="确认密码" prefix-icon="Lock" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" class="submit-btn" @click="handleRegister">
            注 册
          </el-button>
        </el-form-item>
      </el-form>
      <div class="auth-footer">
        已有账号？<router-link to="/login">立即登录</router-link>
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

const form = reactive({ username: '', phone: '', password: '', confirmPassword: '' });
const formRef = ref(null);
const loading = ref(false);

const validatePass = (rule, value, callback) => {
    if (value !== form.password) {
        callback(new Error('两次密码输入不一致'));
    } else {
        callback();
    }
};

const rules = {
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^1[3-9]\\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度至少6位', trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, message: '请确认密码', trigger: 'blur' },
        { validator: validatePass, trigger: 'blur' }
    ]
};

async function handleRegister() {
    const valid = await formRef.value.validate().catch(() => false);
    if (!valid) return;
    loading.value = true;
    const result = await userStore.register(form.username, form.password, form.phone);
    loading.value = false;
    if (result.success) {
        ElMessage.success('注册成功，请登录');
        router.push('/login');
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
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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
.auth-footer a { color: #f5576c; }
</style>
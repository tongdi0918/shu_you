<template>
  <div class="login-container">
    <h1>用户登录</h1>
    <p>登录后获取个性化旅行推荐</p>
    <el-form
      ref="loginFormRef"
      :model="loginForm"
      :rules="loginRules"
      class="login-form"
    >
      <el-form-item prop="username">
        <el-input
          v-model="loginForm.username"
          placeholder="请输入用户名"
          prefix-icon="User"
        />
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          type="password"
          placeholder="请输入密码"
          prefix-icon="Lock"
          show-password
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleLogin" :loading="loading">
          登 录
        </el-button>
      </el-form-item>
    </el-form>
    <p>
      还没有账号？
      <router-link to="/register">立即注册</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../stores/userStore';
import { ElMessage } from 'element-plus';

const router = useRouter();
const userStore = useUserStore();
const loginFormRef = ref(null);
const loading = ref(false);

const loginForm = reactive({
  username: '',
  password: ''
});

const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
};

const handleLogin = async () => {
  if (!loginFormRef.value) return;
  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return;
    loading.value = true;
    const res = await userStore.login(loginForm.username, loginForm.password);
    loading.value = false;
    if (res.success) {
      ElMessage.success('登录成功');
      router.push('/');
    } else {
      ElMessage.error(res.msg);
    }
  });
};
</script>
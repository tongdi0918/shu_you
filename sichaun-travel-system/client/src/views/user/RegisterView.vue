<template>
  <div class="register-container">
    <h1>用户注册</h1>
    <p>加入蜀游记，开启智能旅行</p>
    <el-form
      ref="registerFormRef"
      :model="registerForm"
      :rules="registerRules"
      class="register-form"
    >
      <el-form-item prop="username">
        <el-input
          v-model="registerForm.username"
          placeholder="请输入用户名"
          prefix-icon="User"
        />
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="registerForm.password"
          type="password"
          placeholder="请输入密码"
          prefix-icon="Lock"
          show-password
        />
      </el-form-item>
      <el-form-item prop="confirmPassword">
        <el-input
          v-model="registerForm.confirmPassword"
          type="password"
          placeholder="请确认密码"
          prefix-icon="Lock"
          show-password
        />
      </el-form-item>
      <el-form-item prop="phone">
        <el-input
          v-model="registerForm.phone"
          placeholder="请输入手机号（选填）"
          prefix-icon="Phone"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleRegister" :loading="loading">
          注 册
        </el-button>
      </el-form-item>
    </el-form>
    <p>
      已有账号？
      <router-link to="/login">立即登录</router-link>
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
const registerFormRef = ref(null);
const loading = ref(false);

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  phone: ''
});

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'));
  } else {
    callback();
  }
};

const registerRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
};

const handleRegister = async () => {
  if (!registerFormRef.value) return;
  await registerFormRef.value.validate(async (valid) => {
    if (!valid) return;
    loading.value = true;
    const res = await userStore.register(
      registerForm.username,
      registerForm.password,
      registerForm.phone
    );
    loading.value = false;
    if (res.success) {
      ElMessage.success('注册成功，请登录');
      router.push('/login');
    } else {
      ElMessage.error(res.msg);
    }
  });
};
</script>
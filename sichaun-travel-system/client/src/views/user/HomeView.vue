<!-- client/src/views/user/HomeView.vue -->
<template>
  <div class="home-container">
    <AppHeader />
    
    <!-- Hero 区域 -->
    <section class="hero">
      <h1>天府之国 · 四川</h1>
      <p>探秘蜀地山水，品味川味人间 | 18大5A景区等你来</p>
      <div class="hero-actions">
        <el-button type="primary" size="large" @click="$router.push('/recommend')">
          智能推荐旅行
        </el-button>
        <el-button v-if="userStore.isLoggedIn" size="large" @click="$router.push('/profile')">
          个人中心
        </el-button>
      </div>
    </section>

    <!-- 快捷入口 -->
    <section class="quick-links" v-if="userStore.isLoggedIn">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card shadow="hover" @click="$router.push('/profile')" class="clickable-card">
            <el-icon :size="32" color="#667eea"><User /></el-icon>
            <h4>个人信息</h4>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover" @click="$router.push('/favorites')" class="clickable-card">
            <el-icon :size="32" color="#e6a23c"><Star /></el-icon>
            <h4>我的收藏</h4>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover" @click="$router.push('/history')" class="clickable-card">
            <el-icon :size="32" color="#67c23a"><Clock /></el-icon>
            <h4>浏览历史</h4>
          </el-card>
        </el-col>
      </el-row>
    </section>

    <!-- 景区列表 -->
    <section class="section">
      <h2>🏞️ 四川5A级景区</h2>
      <ScenicList />
    </section>

    <!-- 美食列表 -->
    <section class="section">
      <h2>🍲 天府名菜</h2>
      <FoodList />
    </section>
  </div>
</template>

<script setup>
import AppHeader from '../../components/common/AppHeader.vue';
import ScenicList from '../../components/scenic/ScenicList.vue';
import FoodList from '../../components/food/FoodList.vue';
import { useUserStore } from '../../stores/userStore';

const userStore = useUserStore();
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.hero {
  text-align: center;
  padding: 80px 20px 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.hero h1 {
  font-size: 42px;
  margin-bottom: 16px;
}

.hero p {
  font-size: 18px;
  opacity: 0.9;
  margin-bottom: 32px;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.quick-links {
  max-width: 1200px;
  margin: -30px auto 0;
  padding: 0 20px;
  position: relative;
  z-index: 10;
}

.clickable-card {
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s;
}

.clickable-card:hover {
  transform: translateY(-5px);
}

.clickable-card h4 {
  margin-top: 12px;
  color: #333;
}

.section {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
}

.section h2 {
  font-size: 28px;
  margin-bottom: 24px;
  color: #333;
  border-left: 4px solid #667eea;
  padding-left: 16px;
}
</style>
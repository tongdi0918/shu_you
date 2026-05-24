<template>
  <div class="home-page">
    <!-- ========== 首页自有导航条（保持原样） ========== -->
    <header class="hero-section">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <div class="hero-top-bar">
          <span class="hero-logo">🏔️ 蜀游智行</span>

          <div class="hero-nav-links">
            <router-link to="/login" class="hero-nav-item">
              <span>登录</span>
            </router-link>
            <router-link to="/register" class="hero-nav-item">
              <span>注册</span>
            </router-link>
          </div>



        </div>
        <div class="hero-main">
          <h1 class="hero-title">探秘蜀地山水，品味川味人间</h1>

          <div class="hero-cta">
            <router-link to="/recommend" class="cta-btn primary">智能推荐</router-link>
           
          </div>
        </div>
        <!-- 快捷入口 -->
        <div class="quick-entries">
          <router-link to="/profile" class="quick-entry">
            <span class="entry-icon">👤</span>
            <span class="entry-label">个人信息</span>
          </router-link>
          <router-link to="/favorites" class="quick-entry">
            <span class="entry-icon">⭐</span>
            <span class="entry-label">我的收藏</span>
          </router-link>
          <router-link to="/history" class="quick-entry">
            <span class="entry-icon">📋</span>
            <span class="entry-label">浏览历史</span>
          </router-link>
        </div>
      </div>
    </header>

    <!-- ========== 景区卡片组 ========== -->
    <section class="section scenic-section">
      <div class="section-header">
        <h2 class="section-title">🏔️ 四川景区</h2>
        <el-button
          type="primary"
          :icon="Refresh"
          :loading="scenicLoading"
          @click="refreshSceneries"
          class="refresh-btn"
        >
          刷新
        </el-button>
      </div>
      <div class="card-grid">
        <div
          v-for="item in sceneries"
          :key="item.id"
          class="card"
          @click="goScenicDetail(item.id)"
        >
          <div class="card-image">
            <img :src="item.image_url" :alt="item.name" />
            <span class="card-level">{{ item.level }}</span>
          </div>
          <div class="card-body">
            <h3 class="card-name">{{ item.name }}</h3>
            <p class="card-city">{{ item.city }}</p>
            <p class="card-desc">{{ truncate(item.description, 60) }}</p>
            <div class="card-footer">
              <span class="card-price">¥{{ item.ticket_price }}</span>
              <span class="card-rating">⭐ {{ item.rating }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- 加载中占位 -->
      <div v-if="scenicLoading" class="loading-placeholder">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>正在加载景区...</span>
      </div>
    </section>

    <!-- ========== 美食卡片组 ========== -->
    <section class="section food-section">
      <div class="section-header">
        <h2 class="section-title">🍜 天府名菜</h2>
        <el-button
          type="primary"
          :icon="Refresh"
          :loading="foodLoading"
          @click="refreshFoods"
          class="refresh-btn"
        >
          刷新
        </el-button>
      </div>
      <div class="card-grid">
        <div
          v-for="item in foods"
          :key="item.id"
          class="card"
          @click="goFoodDetail(item.id)"
        >
          <div class="card-image">
            <img :src="item.image_url" :alt="item.name" />
            <span class="card-level food-category">{{ item.category }}</span>
          </div>
          <div class="card-body">
            <h3 class="card-name">{{ item.name }}</h3>
            <p class="card-city">{{ item.city }}</p>
            <p class="card-desc">{{ truncate(item.description, 60) }}</p>
            <div class="card-footer">
              <span class="card-price">¥{{ item.avg_price }}</span>
              <span class="card-rating">⭐ {{ item.rating }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- 加载中占位 -->
      <div v-if="foodLoading" class="loading-placeholder">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>正在加载美食...</span>
      </div>
    </section>

    <!-- 底部 -->
    <footer class="home-footer">
      <p>© 李字雄 For 2026 蜀游智行 version</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Refresh, Loading } from '@element-plus/icons-vue'
import { getRandomSceneries } from '@/api/scenic.js'
import { getRandomFoods } from '@/api/food.js'

const router = useRouter()

// 景区数据
const sceneries = ref([])
const scenicLoading = ref(false)

// 美食数据
const foods = ref([])
const foodLoading = ref(false)

// 页面加载时获取数据
onMounted(() => {
  refreshSceneries()
  refreshFoods()
})

// 随机获取景区
async function refreshSceneries() {
  scenicLoading.value = true
  try {
    const res = await getRandomSceneries(6)
    if (res.code === 200) {
      sceneries.value = res.data
    }
  } catch (e) {
    console.error('获取景区失败:', e)
  } finally {
    scenicLoading.value = false
  }
}

// 随机获取美食
async function refreshFoods() {
  foodLoading.value = true
  try {
    const res = await getRandomFoods(6)
    if (res.code === 200) {
      foods.value = res.data
    }
  } catch (e) {
    console.error('获取美食失败:', e)
  } finally {
    foodLoading.value = false
  }
}

// 跳转景区详情
function goScenicDetail(id) {
  router.push(`/scenic/${id}`)
}

// 跳转美食详情
function goFoodDetail(id) {
  router.push(`/food/${id}`)
}

// 截断文本
function truncate(text, maxLen) {
  if (!text) return ''
  return text.length > maxLen ? text.slice(0, maxLen) + '...' : text
}
</script>

<style scoped>
/* ========== 首页自有导航条样式（保持原样） ========== */
.hero-section {
  position: relative;
  min-height: 500px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: url('@/assets/hero-bg.jpg') center/cover no-repeat;
  opacity: 0.3;
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 40px 20px;
  width: 100%;
  max-width: 1200px;
}

.hero-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 60px;
}

.hero-logo {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
}

.hero-nav-links {
  display: flex;
  gap: 24px;
}

.hero-nav-item {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-size: 15px;
  transition: color 0.3s;
}

.hero-nav-item:hover {
  color: #fff;
}

.hero-main {
  margin-bottom: 50px;
}

.hero-title {
  font-size: 56px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 16px;
  letter-spacing: 4px;
}

.hero-subtitle {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.85);
  margin: 0 0 40px;
}

.hero-cta {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.cta-btn {
  padding: 12px 32px;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s;
}

.cta-btn.primary {
  background: #fff;
  color: #667eea;
}

.cta-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.cta-btn.secondary {
  background: transparent;
  color: #fff;
  border: 2px solid #fff;
}

.cta-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.quick-entries {
  display: flex;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
}

.quick-entry {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.85);
  transition: all 0.3s;
}

.quick-entry:hover {
  color: #fff;
  transform: translateY(-3px);
}

.entry-icon {
  font-size: 32px;
}

.entry-label {
  font-size: 14px;
}

/* ========== 通用区域 ========== */
.section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 50px 20px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.section-title {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.refresh-btn {
  border-radius: 20px;
  padding: 8px 24px;
  font-weight: 600;
}

/* ========== 卡片网格 ========== */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.card-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.card:hover .card-image img {
  transform: scale(1.08);
}

.card-level {
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: #fff;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.food-category {
  background: linear-gradient(135deg, #f368e0, #be2edd);
}

.card-body {
  padding: 16px 20px 20px;
}

.card-name {
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 6px;
}

.card-city {
  font-size: 13px;
  color: #95a5a6;
  margin: 0 0 10px;
}

.card-desc {
  font-size: 14px;
  color: #636e72;
  line-height: 1.6;
  margin: 0 0 14px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-price {
  font-size: 18px;
  font-weight: 700;
  color: #e74c3c;
}

.card-rating {
  font-size: 14px;
  color: #f39c12;
  font-weight: 600;
}

/* ========== 加载占位 ========== */
.loading-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px;
  color: #95a5a6;
  font-size: 15px;
}

/* ========== 底部 ========== */
.home-footer {
  text-align: center;
  padding: 30px 20px;
  color: #95a5a6;
  font-size: 14px;
  border-top: 1px solid #ecf0f1;
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .hero-title {
    font-size: 36px;
  }
  .hero-subtitle {
    font-size: 16px;
  }
  .card-grid {
    grid-template-columns: 1fr;
  }
  .section-title {
    font-size: 22px;
  }
}
</style>
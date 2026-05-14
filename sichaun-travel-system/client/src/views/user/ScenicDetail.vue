<!-- client/src/views/user/ScenicDetail.vue -->
<template>
  <div class="detail-page">
    <LoadingSpinner v-if="loading" text="加载景区详情..." />
    <template v-else-if="scenic">
      <div class="detail-hero" :style="{ backgroundImage: `url(${scenic.image_url || '/images/default.jpg'})` }">
        <div class="hero-mask">
          <h1>{{ scenic.name }}</h1>
          <div class="hero-meta">
            <span>📍 {{ scenic.city }}</span>
            <span>⭐ {{ scenic.rating }}</span>
            <span>🏷️ {{ scenic.level }}级景区</span>
          </div>
        </div>
      </div>
      <div class="detail-container">
        <div class="detail-main">
          <div class="info-card">
            <h3>📖 景区故事</h3>
            <p class="description">{{ scenic.description }}</p>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <span class="label">💴 门票价格</span>
              <span class="value">¥{{ scenic.ticket_price || '暂无' }}</span>
            </div>
            <div class="info-item">
              <span class="label">🕐 开放时间</span>
              <span class="value">{{ scenic.opening_hours || '全天' }}</span>
            </div>
            <div class="info-item">
              <span class="label">🌸 最佳季节</span>
              <span class="value">{{ scenic.season_best || '四季皆宜' }}</span>
            </div>
            <div class="info-item">
              <span class="label">🏷️ 标签</span>
              <span class="value">{{ scenic.tags || '暂无标签' }}</span>
            </div>
          </div>

          <!-- 预警信息 -->
          <div v-if="scenic.warning" class="warning-card">
            <h3>⚠️ 实时预警</h3>
            <div class="warning-info">
              <p>天气：{{ scenic.warning.weather_type }} | 温度：{{ scenic.warning.temperature }}°C</p>
              <p>拥堵等级：
                <el-tag :type="scenic.warning.congestion_level === 'high' ? 'danger' : 'warning'" size="small">
                  {{ scenic.warning.congestion_level === 'high' ? '拥堵' : '中等' }}
                </el-tag>
              </p>
              <p class="warning-text">{{ scenic.warning.warning_text }}</p>
            </div>
          </div>
        </div>

        <div class="detail-sidebar">
          <el-card>
            <h4>📍 快速操作</h4>
            <el-button type="primary" class="side-btn" @click="$router.push('/route-plan')">
              🚗 规划路线
            </el-button>
            <el-button type="warning" class="side-btn" @click="handleBookmark">
              🔖 收藏景区
            </el-button>
            <a href="https://www.ctrip.com/" target="_blank" rel="noopener" class="ctrip-link">
              <el-button type="success" class="side-btn">
                🎫 携程订票
              </el-button>
            </a>
          </el-card>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getScenicDetail } from '../../api/scenic';
import LoadingSpinner from '../../components/common/LoadingSpinner.vue';
import { ElMessage } from 'element-plus';

const route = useRoute();
const scenic = ref(null);
const loading = ref(true);

onMounted(async () => {
    try {
        const res = await getScenicDetail(route.params.id);
        scenic.value = res.data;
    } catch (e) {
        ElMessage.error('加载景区详情失败');
    }
    loading.value = false;
});

function handleBookmark() {
    ElMessage.success('已加入收藏');
}
</script>

<style scoped>
.detail-hero {
    height: 350px;
    background-size: cover;
    background-position: center;
    position: relative;
}
.hero-mask {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent, rgba(0,0,0,0.8));
    padding: 40px 60px;
    color: #fff;
}
.hero-mask h1 { margin: 0 0 10px; font-size: 32px; }
.hero-meta { display: flex; gap: 24px; font-size: 14px; }
.detail-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 30px 20px;
    display: flex;
    gap: 30px;
}
.detail-main { flex: 1; }
.info-card {
    background: #fff;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 20px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.info-card h3 { margin: 0 0 12px; color: #2c3e50; }
.description { line-height: 1.8; color: #606266; margin: 0; }
.info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 20px;
}
.info-item {
    background: #fff;
    border-radius: 10px;
    padding: 16px;
    box-shadow: 0 1px 6px rgba(0,0,0,0.04);
}
.label { display: block; font-size: 12px; color: #909399; margin-bottom: 4px; }
.value { font-size: 16px; color: #2c3e50; font-weight: 600; }
.warning-card {
    background: #fef0f0;
    border-radius: 12px;
    padding: 20px;
    border: 1px solid #fbc4c4;
}
.warning-card h3 { margin: 0 0 10px; color: #f56c6c; }
.warning-text { color: #f56c6c; margin-top: 8px; }
.detail-sidebar { width: 280px; }
.side-btn { width: 100%; margin-bottom: 10px; }
.ctrip-link { display: block; text-decoration: none; }
</style>
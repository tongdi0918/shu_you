<template>
  <div class="food-detail-page">
    <!-- 导航条通过 App.vue 全局引入，此处保持原样 -->
    <div class="food-detail-container" v-if="food">
      <!-- 顶部横幅 -->
      <div class="food-banner" :style="{ backgroundImage: `url(${food.image_url})` }">
        <div class="food-banner-overlay">
          <h1 class="food-title">{{ food.name }}</h1>
          <div class="food-basic-info">
            <span class="info-item">💰 人均 ¥{{ food.avg_price }}</span>
            <span class="info-item">⭐ {{ food.rating }}</span>
            <span class="info-item">📍 {{ food.city }}</span>
            <span class="info-item">🏷️ {{ food.category }}</span>
          </div>
        </div>
      </div>

      <!-- 美食介绍主体 -->
      <div class="food-content">
        <!-- 故事化描述 -->
        <div class="section food-story">
          <h2>📖 美食故事</h2>
          <p class="story-text">{{ food.description }}</p>
        </div>

        <!-- 详细特点 -->
        <div class="section food-features">
          <h2>✨ 特色亮点</h2>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">🌶️</div>
              <h4>口味特点</h4>
              <p>{{ getFlavorDescription(food) }}</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">📜</div>
              <h4>历史渊源</h4>
              <p>{{ getHistoryDescription(food) }}</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🍽️</div>
              <h4>推荐吃法</h4>
              <p>{{ getEatingGuide(food) }}</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">📍</div>
              <h4>最佳品尝地</h4>
              <p>首选{{ food.city }}当地老字号餐馆，正宗地道风味</p>
            </div>
          </div>
        </div>

        <!-- 标签 -->
        <div class="section food-tags-section">
          <h2>🏷️ 标签</h2>
          <div class="tag-list">
            <span class="tag-item" v-for="tag in parseTags(food.tags)" :key="tag">{{ tag }}</span>
          </div>
        </div>

        <!-- 价格参考 -->
        <div class="section food-price-section">
          <h2>💰 价格参考</h2>
          <div class="price-card">
            <span class="price-label">人均消费</span>
            <span class="price-value">¥{{ food.avg_price }}</span>
            <span class="price-note">（实际价格以餐厅为准）</span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="food-actions">
          <el-button type="primary" size="large" @click="goBack">🔙 返回列表</el-button>
          <el-button type="danger" size="large" @click="toggleFavorite" v-if="userStore.isLoggedIn">
            {{ isFavorited ? '❤️ 已收藏' : '🤍 加入收藏' }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 加载中 -->
    <div class="loading-container" v-else>
      <el-skeleton :rows="10" animated />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import axios from 'axios'
import { addFavorite, deleteFavorite, recordBrowse } from '@/api/user'
import { recordBehavior } from '@/api/recommend'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const food = ref(null)
const isFavorited = ref(false)

// 根据美食名称生成口味描述（基于数据库预设数据）
function getFlavorDescription(f) {
  const map = {
    '麻婆豆腐': '麻、辣、烫、香、酥、嫩、鲜、活——八字真经。花椒的麻与辣椒的辣完美融合，嫩豆腐入口即化。',
    '乐山钵钵鸡': '红油芝麻汤底浸泡，麻辣鲜香在舌尖炸开。竹签串起的不仅是食材，更是乐山街头的烟火气。',
    '宫保鸡丁': '甜酸与微辣的平衡臻于化境。花生酥脆、鸡肉嫩滑、葱段清香，是川菜中少有的"不辣也能让人魂牵梦萦"的经典。',
    '担担面': '细面浇上肉臊子和芝麻酱，干香四溢。一碗担担面，半碗是故事，是成都人最温暖的早餐记忆。',
    '跷脚牛肉': '新鲜牛肉在中药材熬制的汤底中涮烫，肉嫩汤鲜。蘸上辣椒干碟，整个乐山都在舌尖鲜活起来。',
    '宜宾燃面': '面条裹满花生碎、芽菜和红油，干香四溢。因面干油重、点火即燃而得名，是长江源头最炽热的一碗烟火。'
  }
  return map[f.name] || `${f.name}是${f.city}的代表性${f.category}，以独特的风味和精湛的烹饪技艺闻名。`
}

// 历史渊源
function getHistoryDescription(f) {
  const map = {
    '麻婆豆腐': '陈麻婆始创于清朝同治年间（1862年），至今已有160余年历史。从成都万福桥边的小饭馆走向世界。',
    '乐山钵钵鸡': '起源于清代末年的乐山街头，已有百余年历史。最早是小贩用陶钵盛装沿街叫卖，故名"钵钵鸡"。',
    '宫保鸡丁': '由清代四川总督丁宝桢（宫保是其荣誉官衔）创制，距今已有150余年历史，是川菜走向世界的代表。',
    '担担面': '百年前小贩挑担沿街叫卖，一头是炉火铁锅，一头是面条调料，"担担面"由此得名。',
    '跷脚牛肉': '起源于乐山苏稽镇，已有百年历史。传说食客因味道太美，吃时跷起二郎腿细细品味，故得名。',
    '宜宾燃面': '宜宾人的一天从一碗燃面开始，流传已有数百年历史，是宜宾最具代表性的市井美食。'
  }
  return map[f.name] || `${f.name}是${f.city}的传统名吃，历史悠久，深受当地人和游客喜爱。`
}

// 推荐吃法
function getEatingGuide(f) {
  const map = {
    '麻婆豆腐': '建议搭配白米饭食用，豆腐的麻辣与米饭的清香相得益彰。也可作为下酒菜，配一杯冰啤酒。',
    '乐山钵钵鸡': '从钵中自取，一口一串。建议搭配冰粉或凉糕解辣，体验完整的乐山美食之旅。',
    '宫保鸡丁': '趁热食用口感最佳。搭配米饭或馒头，花生米的酥脆与鸡肉的嫩滑层次分明。',
    '担担面': '上桌后立即拌匀，让每一根面条都裹满酱汁。建议配一碗清汤，趁热吃完。',
    '跷脚牛肉': '涮烫即食，先喝汤再吃肉。搭配秘制辣椒干碟，蘸着吃更香。',
    '宜宾燃面': '拌匀后立即食用，感受面条的干香与芽菜的咸香。建议搭配一碗骨头汤。'
  }
  return map[f.name] || `到${f.city}当地的知名餐馆品尝最正宗的味道，体验地道的川味风情。`
}

// 解析标签
function parseTags(tags) {
  if (!tags) return []
  return tags.split(',').filter(Boolean)
}

// 加载美食详情
async function loadFood() {
  try {
    const id = route.params.id
    const res = await axios.get(`/api/food/${id}`)
    food.value = res.data.data || res.data
    // 记录浏览
    if (userStore.isLoggedIn) {
      recordBrowse({ itemType: 'food', itemId: Number(id) }).catch(() => {})
      recordBehavior({ itemType: 'food', itemId: Number(id), action: 'view' }).catch(() => {})
    }
  } catch (e) {
    ElMessage.error('加载美食详情失败')
  }
}

// 收藏/取消收藏
async function toggleFavorite() {
  try {
    if (isFavorited.value) {
      await deleteFavorite(food.value.id)
      isFavorited.value = false
      ElMessage.success('已取消收藏')
    } else {
      await addFavorite({ itemType: 'food', itemId: food.value.id })
      isFavorited.value = true
      ElMessage.success('收藏成功')
    }
  } catch {
    ElMessage.error('操作失败')
  }
}

// 返回
function goBack() {
  router.back()
}

onMounted(() => {
  loadFood()
})
</script>

<style scoped>
.food-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
}
.food-detail-container {
  max-width: 900px;
  margin: 0 auto;
  padding-bottom: 40px;
}
.food-banner {
  height: 350px;
  background-size: cover;
  background-position: center;
  position: relative;
}
.food-banner-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.8));
  padding: 60px 30px 30px;
  color: #fff;
}
.food-title {
  font-size: 32px;
  margin: 0 0 12px;
}
.food-basic-info {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}
.info-item {
  font-size: 15px;
}
.food-content {
  padding: 20px 30px;
}
.section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
}
.section h2 {
  margin: 0 0 16px;
  font-size: 20px;
  color: #2c3e50;
  border-left: 4px solid #e74c3c;
  padding-left: 12px;
}
.story-text {
  font-size: 16px;
  line-height: 1.8;
  color: #444;
  text-indent: 2em;
}
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}
.feature-card {
  background: #fefefe;
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  padding: 16px;
  text-align: center;
}
.feature-icon {
  font-size: 32px;
  margin-bottom: 8px;
}
.feature-card h4 {
  margin: 0 0 8px;
  color: #e74c3c;
}
.feature-card p {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
}
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.tag-item {
  background: #fef0f0;
  color: #e74c3c;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
}
.price-card {
  display: flex;
  align-items: baseline;
  gap: 12px;
}
.price-label { font-size: 16px; color: #666; }
.price-value { font-size: 28px; color: #e67e22; font-weight: bold; }
.price-note { font-size: 13px; color: #999; }
.food-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  padding-top: 20px;
}
.loading-container {
  max-width: 900px;
  margin: 40px auto;
  padding: 20px;
}
</style>
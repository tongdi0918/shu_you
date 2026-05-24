<template>
  <div class="profile-page">
    <div class="profile-container">
      <h2 class="page-title">👤 个人信息</h2>

      <!-- 用户基本信息 -->
      <div class="profile-card">
        <div class="avatar-section">
          <el-avatar :size="80" :src="profile.avatar">{{ profile.username?.charAt(0)?.toUpperCase() }}</el-avatar>
        </div>
        <div class="info-section">
          <p><strong>用户名：</strong>{{ profile.username }}</p>
          <p><strong>注册时间：</strong>{{ formatDate(profile.created_at) }}</p>
          <p><strong>手机号：</strong>{{ profile.phone || '未设置' }}</p>
        </div>
        <el-button type="primary" @click="showEditDialog = true">✏️ 修改信息</el-button>
      </div>

      <!-- 用户成就区块 -->
      <div class="achievement-section">
        <h3>🏆 我的成就 · 蜀游打卡</h3>
        <p class="achievement-hint">点击方块标记你已实地到访的景点和美食吧！</p>

        <el-tabs v-model="activeTab" type="card">
          <el-tab-pane label="🏔️ 景点打卡" name="scenery">
            <div class="achievement-grid">
              <div
                v-for="item in allSceneries"
                :key="'s-' + item.id"
                class="achievement-block"
                :class="{ 'achieved': visitedSceneries.has(item.id) }"
                @click="toggleAchievement('scenery', item.id, item.name)"
              >
                <div class="block-icon">🏔️</div>
                <div class="block-name">{{ item.name }}</div>
                <div class="block-city">{{ item.city }}</div>
                <div class="block-check" v-if="visitedSceneries.has(item.id)">✅</div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="🍜 美食打卡" name="food">
            <div class="achievement-grid">
              <div
                v-for="item in allFoods"
                :key="'f-' + item.id"
                class="achievement-block food-block"
                :class="{ 'achieved': visitedFoods.has(item.id) }"
                @click="toggleAchievement('food', item.id, item.name)"
              >
                <div class="block-icon">🍜</div>
                <div class="block-name">{{ item.name }}</div>
                <div class="block-city">{{ item.city }}</div>
                <div class="block-check" v-if="visitedFoods.has(item.id)">✅</div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>

        <div class="achievement-stats">
          <div class="stat-item">
            <span class="stat-number">{{ visitedSceneries.size }}</span>
            <span class="stat-label">景点已打卡</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ visitedFoods.size }}</span>
            <span class="stat-label">美食已打卡</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ visitedSceneries.size + visitedFoods.size }}</span>
            <span class="stat-label">总计成就</span>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="showEditDialog" title="修改个人信息" width="400px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="手机号">
          <el-input v-model="editForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="头像URL">
          <el-input v-model="editForm.avatar" placeholder="请输入头像URL" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="saveProfile">保存修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { getProfile, updateProfile } from '@/api/user'
import { getSceneries } from '@/api/scenic'
import { getFoods } from '@/api/food'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const userStore = useUserStore()

const profile = ref({ username: '', phone: '', avatar: '', created_at: '' })
const showEditDialog = ref(false)
const editForm = ref({ phone: '', avatar: '' })

const activeTab = ref('scenery')
const allSceneries = ref([])
const allFoods = ref([])
const visitedSceneries = ref(new Set())
const visitedFoods = ref(new Set())

async function loadProfile() {
  try {
    const res = await getProfile()
    profile.value = res.data || res
    editForm.value.phone = profile.value.phone || ''
    editForm.value.avatar = profile.value.avatar || ''
  } catch (e) {
    console.error('加载个人信息失败', e)
  }
}

async function saveProfile() {
  try {
    await updateProfile({ phone: editForm.value.phone, avatar: editForm.value.avatar })
    ElMessage.success('个人信息更新成功')
    showEditDialog.value = false
    loadProfile()
  } catch (e) {
    ElMessage.error('更新失败')
  }
}

async function loadAllSceneries() {
  try {
    const res = await getSceneries({ pageSize: 100 })
    allSceneries.value = res.data || res.data?.data || []
  } catch (e) {
    console.error('加载景点失败', e)
  }
}

async function loadAllFoods() {
  try {
    const res = await getFoods({ pageSize: 100 })
    allFoods.value = res.data || res.data?.data || []
  } catch (e) {
    console.error('加载美食失败', e)
  }
}

async function loadAchievements() {
  try {
    const token = localStorage.getItem('token')
    if (!token) return
    const res = await axios.get('/api/user/achievements', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = res.data.data || res.data || {}
    visitedSceneries.value = new Set(data.sceneries || [])
    visitedFoods.value = new Set(data.foods || [])
  } catch (e) {
    console.error('加载成就失败', e)
  }
}

async function toggleAchievement(type, itemId, itemName) {
  const token = localStorage.getItem('token')
  if (!token) {
    ElMessage.warning('请先登录')
    return
  }
  const setMap = type === 'scenery' ? visitedSceneries : visitedFoods
  const isCurrentlyVisited = setMap.value.has(itemId)

  try {
    await axios.post('/api/user/achievements/toggle', {
      itemType: type,
      itemId: itemId,
      visited: !isCurrentlyVisited
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (isCurrentlyVisited) {
      setMap.value.delete(itemId)
      ElMessage.info(`已取消"${itemName}"的打卡`)
    } else {
      setMap.value.add(itemId)
      ElMessage.success(`🎉 恭喜！成功打卡"${itemName}"！`)
    }
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

onMounted(() => {
  loadProfile()
  loadAllSceneries()
  loadAllFoods()
  loadAchievements()
})
</script>

<style scoped>
/* 保持原有样式 */
.profile-page { min-height: 100vh; background: #f5f5f5; }
.profile-container { max-width: 900px; margin: 0 auto; padding: 24px; }
.page-title { font-size: 24px; margin-bottom: 20px; color: #2c3e50; }
.profile-card { background: #fff; border-radius: 12px; padding: 24px; display: flex; align-items: center; gap: 24px; margin-bottom: 24px; flex-wrap: wrap; }
.avatar-section { flex-shrink: 0; }
.info-section p { margin: 6px 0; font-size: 15px; color: #555; }
.achievement-section { background: #fff; border-radius: 12px; padding: 24px; }
.achievement-section h3 { margin: 0 0 8px; font-size: 20px; color: #2c3e50; }
.achievement-hint { color: #999; font-size: 13px; margin-bottom: 16px; }
.achievement-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; padding: 16px 0; }
.achievement-block {
  background: #f9f9f9; border: 2px solid #e0e0e0; border-radius: 12px; padding: 16px 12px; text-align: center;
  cursor: pointer; transition: all 0.3s ease; position: relative;
}
.achievement-block:hover { border-color: #e74c3c; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(231,76,60,0.2); }
.achievement-block.achieved {
  background: linear-gradient(135deg, #fff5f5, #ffe8e8); border-color: #e74c3c;
  transform: translateY(-6px); box-shadow: 0 8px 24px rgba(231,76,60,0.35);
}
.achievement-block.achieved .block-icon { filter: drop-shadow(0 2px 4px rgba(231,76,60,0.5)); }
.block-icon { font-size: 32px; margin-bottom: 8px; transition: transform 0.3s; }
.achievement-block.achieved .block-icon { transform: scale(1.2); }
.block-name { font-size: 13px; font-weight: bold; color: #2c3e50; margin-bottom: 4px; }
.block-city { font-size: 11px; color: #999; }
.block-check { position: absolute; top: 6px; right: 8px; font-size: 16px; }
.achievement-stats { display: flex; justify-content: space-around; padding: 20px 0 0; border-top: 1px solid #f0f0f0; margin-top: 20px; }
.stat-item { text-align: center; }
.stat-number { display: block; font-size: 28px; font-weight: bold; color: #e74c3c; }
.stat-label { font-size: 13px; color: #999; }
</style>
<!-- sichaun-travel-system/client/src/views/user/ProfileView.vue -->
<template>
  <div class="profile-page">
    <!-- 头部 -->
    <div class="page-header">
      <h2>👤 个人信息</h2>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="loading-container">
      <el-icon class="is-loading" :size="32"><Loading /></el-icon>
      <p>加载中...</p>
    </div>

    <!-- 表单 + 成就 -->
    <div v-else>
      <!-- 基本信息表单（无头像） -->
      <div class="profile-form">
        <el-form :model="form" label-width="80px" size="large">
          <el-form-item label="用户名">
            <el-input v-model="form.username" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="手机号">
            <el-input v-model="form.phone" placeholder="请输入手机号" />
          </el-form-item>
          <el-form-item label="注册时间">
            <span class="info-text">{{ formatTime(form.created_at) }}</span>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveProfile" :loading="saving">
              保存修改
            </el-button>
            <el-button @click="$router.push('/')">返回首页</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 成就墙：我去过的景点 & 我吃过的美食 -->
      <div class="achievement-section">
        <h3>🏆 我的旅行成就</h3>
        <p class="achievement-tip">这些是你曾经浏览过的地方，代表你已经“打卡”！</p>

        <div v-if="achievements.loading" class="loading-container">
          <el-icon class="is-loading"><Loading /></el-icon>
        </div>

        <template v-else>
          <!-- 景区成就 -->
          <div class="achievement-group" v-if="achievements.sceneries.length > 0">
            <h4>🗺️ 打卡的景区</h4>
            <div class="achievement-grid">
              <div
                class="achievement-card"
                v-for="item in achievements.sceneries"
                :key="'s-' + item.item_id"
                @click="goDetail('scenic', item.item_id)"
              >
                <img :src="item.item_image || '/placeholder.jpg'" alt="" />
                <span class="card-name">{{ item.item_name }}</span>
              </div>
            </div>
          </div>

          <!-- 美食成就 -->
          <div class="achievement-group" v-if="achievements.foods.length > 0">
            <h4>🍜 品尝过的美食</h4>
            <div class="achievement-grid">
              <div
                class="achievement-card"
                v-for="item in achievements.foods"
                :key="'f-' + item.item_id"
                @click="goDetail('food', item.item_id)"
              >
                <img :src="item.item_image || '/placeholder.jpg'" alt="" />
                <span class="card-name">{{ item.item_name }}</span>
              </div>
            </div>
          </div>

          <el-empty v-if="achievements.sceneries.length === 0 && achievements.foods.length === 0"
            description="还没有成就，快去探索四川吧！" />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const router = useRouter();
const loading = ref(true);
const saving = ref(false);
const form = reactive({
  username: '',
  phone: '',
  created_at: ''
});

const achievements = reactive({
  loading: true,
  sceneries: [],
  foods: []
});

// 加载个人信息
const loadProfile = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    ElMessage.warning('请先登录');
    router.push('/login');
    return;
  }

  try {
    const res = await fetch('/api/user/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.code === 200) {
      form.username = data.data.username;
      form.phone = data.data.phone;
      form.created_at = data.data.created_at;
    } else {
      ElMessage.error(data.msg || '获取失败');
    }
  } catch (e) {
    ElMessage.error('网络错误');
  } finally {
    loading.value = false;
  }
};

// 加载成就数据（浏览历史）
const loadAchievements = async () => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const res = await fetch('/api/user/history', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.code === 200) {
      // 按类型分组
      achievements.sceneries = (data.data || []).filter(h => h.item_type === 'scenery');
      achievements.foods = (data.data || []).filter(h => h.item_type === 'food');
    }
  } catch (e) {
    // 静默失败
  } finally {
    achievements.loading = false;
  }
};

// 保存信息
const saveProfile = async () => {
  saving.value = true;
  const token = localStorage.getItem('token');
  try {
    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        username: form.username,
        phone: form.phone
        // 头像字段已删除，不再上传
      })
    });
    const data = await res.json();
    if (data.code === 200) {
      ElMessage.success('更新成功');
    } else {
      ElMessage.error(data.msg || '更新失败');
    }
  } catch (e) {
    ElMessage.error('网络错误');
  } finally {
    saving.value = false;
  }
};

// 跳转详情
const goDetail = (type, id) => {
  if (type === 'scenic') {
    router.push(`/scenic/${id}`);
  } else {
    router.push(`/food/${id}`);
  }
};

// 格式化时间
const formatTime = (time) => {
  if (!time) return '';
  return new Date(time).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(() => {
  loadProfile();
  loadAchievements();
});
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40px;
}

.page-header {
  background: linear-gradient(135deg, #409EFF, #67C23A);
  color: white;
  padding: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
  color: #909399;
}

.profile-form {
  margin: 12px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.info-text {
  color: #909399;
  font-size: 14px;
}

.achievement-section {
  margin: 12px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.achievement-section h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  color: #E44D26;
}

.achievement-tip {
  font-size: 12px;
  color: #909399;
  margin-bottom: 16px;
}

.achievement-group {
  margin-bottom: 20px;
}

.achievement-group h4 {
  font-size: 15px;
  color: #303133;
  margin-bottom: 10px;
}

.achievement-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.achievement-card {
  background: #f9f9f9;
  border-radius: 10px;
  padding: 8px;
  text-align: center;
  cursor: pointer;
  transition: 0.2s;
}

.achievement-card:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.achievement-card img {
  width: 100%;
  height: 70px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 6px;
}

.card-name {
  font-size: 12px;
  color: #606266;
  line-height: 1.3;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
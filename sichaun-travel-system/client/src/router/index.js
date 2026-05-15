// client/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  // 用户端
  { path: '/', name: 'Home', component: () => import('../views/user/HomeView.vue') },
  { path: '/login', name: 'Login', component: () => import('../views/user/LoginView.vue') },
  { path: '/register', name: 'Register', component: () => import('../views/user/RegisterView.vue') },
  { path: '/scenic/:id', name: 'ScenicDetail', component: () => import('../views/user/ScenicDetail.vue') },
  { path: '/food/:id', name: 'FoodDetail', component: () => import('../views/user/FoodDetail.vue') },
  { path: '/recommend', name: 'Recommend', component: () => import('../views/user/RecommendView.vue') },
  { path: '/route-plan', name: 'RoutePlan', component: () => import('../views/user/RoutePlanView.vue') },
  // 🆕 用户个人中心
  { path: '/profile', name: 'Profile', component: () => import('../views/user/ProfileView.vue'), meta: { requiresAuth: true } },
  { path: '/favorites', name: 'Favorites', component: () => import('../views/user/FavoritesView.vue'), meta: { requiresAuth: true } },
  { path: '/history', name: 'History', component: () => import('../views/user/HistoryView.vue'), meta: { requiresAuth: true } },
  // 管理端
  { path: '/admin', name: 'AdminLogin', component: () => import('../views/admin/AdminLogin.vue') },
  { path: '/admin/dashboard', name: 'Dashboard', component: () => import('../views/admin/Dashboard.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/admin/scenic', name: 'ScenicManager', component: () => import('../views/admin/ScenicManager.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/admin/food', name: 'FoodManager', component: () => import('../views/admin/FoodManager.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 导航守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  if (to.meta.requiresAuth && !token) {
    ElMessage.warning('请先登录');
    next('/login');
    return;
  }

  if (to.meta.requiresAdmin && user?.role !== 'admin') {
    ElMessage.error('权限不足');
    next('/');
    return;
  }

  next();
});

export default router;
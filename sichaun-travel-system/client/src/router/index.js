// client/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    // 用户端
    { path: '/',             name:'Home', component: ()=>import('../views/user/HomeView.vue') },
    { path: '/login',        name:'Login', component: ()=>import('../views/user/LoginView.vue') },
    { path: '/register',     name:'Register', component: ()=>import('../views/user/RegisterView.vue') },
    { path: '/scenic/:id',   name:'ScenicDetail', component: ()=>import('../views/user/ScenicDetail.vue') },
            // ✅ 新增美食详情页路由
    { path: '/food/:id', name:'FoodDetail', component: ()=>import('../views/user/FoodDetail.vue') },
    { path: '/recommend',    name:'Recommend', component: ()=>import('../views/user/RecommendView.vue') },
    { path: '/route-plan',   name:'RoutePlan', component: ()=>import('../views/user/RoutePlanView.vue') },
    // 管理端
    { path: '/admin',            name:'AdminLogin', component: ()=>import('../views/admin/AdminLogin.vue') },
    { path: '/admin/dashboard',  name:'Dashboard', component: ()=>import('../views/admin/Dashboard.vue') },
    { path: '/admin/scenic',     name:'ScenicManager', component: ()=>import('../views/admin/ScenicManager.vue') },
    { path: '/admin/food',       name:'FoodManager', component: ()=>import('../views/admin/FoodManager.vue') },
];

export default createRouter({ history: createWebHistory(), routes });
// client/src/api/index.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 30000,
});

// 请求拦截器 - 添加 token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 获取用户当前位置
export const getCurrentCity = () => api.get('/user/current-city');

// 更新用户当前位置
export const updateCurrentCity = (current_city) => 
  api.put('/user/current-city', { current_city });

// 获取按城市分组的景区与美食
export const getGroupedByCity = () => api.get('/recommend/grouped-by-city');

// 基于用户选择生成规划
export const generateCustomPlan = (selectedSceneries, selectedFoods, currentCity) =>
  api.post('/recommend/custom-plan', { selectedSceneries, selectedFoods, currentCity });

// 多地点路线规划
export const getMultiPointRoute = (origin, destination, waypoints) =>
  api.post('/route/multi-point', { origin, destination, waypoints });

export default api;
// client/src/api/request.js
import axios from 'axios';
import { ElMessage } from 'element-plus';

const service = axios.create({ baseURL: '/api', timeout: 15000 });
service.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});
service.interceptors.response.use(
    res => res.data,
    err => { ElMessage.error(err.response?.data?.msg || '请求失败'); return Promise.reject(err); }
);
export default service;

// client/src/api/scenic.js
import request from './request';
export const getSceneries = () => request.get('/scenic/list');
export const getScenicDetail = (id) => request.get(`/scenic/${id}`);

// client/src/api/recommend.js
import request from './request';
export const getUserRecommend = () => request.get('/recommend/user');

// client/src/api/route.js
import request from './request';
export const planRoute = (params) => request.post('/route/plan', params);
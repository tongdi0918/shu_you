// client/src/api/request.js
import axios from 'axios';
import { ElMessage } from 'element-plus';

const service = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

service.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

service.interceptors.response.use(
  (res) => {
    // 直接返回服务端响应的 data 部分
    const body = res.data;
    if (body.code && body.code !== 200) {
      ElMessage.error(body.msg || '请求失败');
      return Promise.reject(new Error(body.msg || '请求失败'));
    }
    return body;
  },
  (err) => {
    const msg = err.response?.data?.msg || err.message || '请求失败';
    ElMessage.error(msg);
    return Promise.reject(err);
  }
);

export default service;
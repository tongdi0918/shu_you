// client/src/api/route.js（完整版）
import request from './request';

// 提交路线规划请求
export const planRoute = (params) => request.post('/route/plan', params);

// 获取用户历史路线
export const getRouteHistory = () => request.get('/route/history');
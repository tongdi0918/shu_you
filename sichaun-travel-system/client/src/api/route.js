// client/src/api/route.js（完整版）
import request from './request';

// 提交路线规划请求
export const planRoute = (params) => request.post('/route/plan', params);

// 获取用户历史路线
export const getRouteHistory = () => request.get('/route/history');


// 如果后续需要从后端获取路线数据，可以在这里定义接口
export const planDriveRoute = (data) => {
  // return request.post('/api/route/plan', data);
  // 暂时不使用后端接口，前端直接使用高德API
  return Promise.resolve();
};

// 如果需要获取地点建议，可以定义此接口
export const getLocationSuggest = (keywords) => {
  // return request.get('/api/location/suggest', { params: { keywords } });
  return Promise.resolve([]);
};
// client/src/api/scenic.js
import request from './request';

// 获取景区列表（支持分页、筛选）
export const getSceneries = (params) => request.get('/scenic/list', { params });

// 获取景区详情
export const getScenicDetail = (id) => request.get(`/scenic/${id}`);

// 获取所有景区城市（筛选用）
export const getScenicCities = () => request.get('/scenic/cities/list');

// 获取热门景区
export const getPopularSceneries = (limit = 5) => request.get('/recommend/popular', { params: { type: 'scenery', limit } });


// 新增景区
export function createScenic(data) {
  return request.post('/sceneries', data)
}

// 更新景区
export function updateScenic(id, data) {
  return request.put(`/sceneries/${id}`, data)
}

// 删除景区
export function deleteScenic(id) {
  return request.delete(`/sceneries/${id}`)
}
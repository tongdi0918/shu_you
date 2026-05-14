// client/src/api/admin.js
import request from './request';

// 景区管理
export const getAdminSceneries = () => request.get('/admin/sceneries');
export const createScenic = (data) => request.post('/admin/sceneries', data);
export const updateScenic = (data) => request.put(`/admin/sceneries/${data.id}`, data);
export const deleteScenic = (id) => request.delete(`/admin/sceneries/${id}`);

// 美食管理
export const getAdminFoods = () => request.get('/admin/foods');
export const createFood = (data) => request.post('/admin/foods', data);
export const updateFood = (data) => request.put(`/admin/foods/${data.id}`, data);
export const deleteFood = (id) => request.delete(`/admin/foods/${id}`);

// 统计
export const getAdminStats = () => request.get('/admin/stats');
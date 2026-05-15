// client/src/api/user.js
import request from './request';

// 获取个人信息
export const getProfile = () => request.get('/user/profile');

// 更新个人信息
export const updateProfile = (data) => request.put('/user/profile', data);

// 获取我的收藏
export const getFavorites = (params) => request.get('/user/favorites', { params });

// 添加收藏
export const addFavorite = (data) => request.post('/user/favorites', data);

// 取消收藏
export const deleteFavorite = (id) => request.delete(`/user/favorites/${id}`);

// 获取浏览历史
export const getBrowseHistory = () => request.get('/user/history');

// 记录浏览
export const recordBrowse = (data) => request.post('/user/history', data);
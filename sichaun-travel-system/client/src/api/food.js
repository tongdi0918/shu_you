// client/src/api/food.js（完整版）
import request from './request';

export const getFoods = (params) => request.get('/food/list', { params });
export const getFoodDetail = (id) => request.get(`/food/${id}`);
export const getFoodCategories = () => request.get('/food/categories/list');
export const getPopularFoods = (limit = 5) => request.get('/recommend/popular', { params: { type: 'food', limit } });
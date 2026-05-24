// client/src/api/food.js
import request from './request';

export const getFoods = (params) => request.get('/food/list', { params });

export const getFoodDetail = (id) => request.get(`/food/${id}`);

export const getFoodCategories = () => request.get('/food/categories/list');

export const getPopularFoods = (limit = 5) =>
  request.get('/recommend/popular', { params: { type: 'food', limit } });

//随机获取美食列表
export const getRandomFoods = (limit = 6) =>
  request.get('/food/random', { params: { limit } });
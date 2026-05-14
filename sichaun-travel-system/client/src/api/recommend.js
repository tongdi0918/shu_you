// client/src/api/recommend.js（完整版）
import request from './request';

// 获取用户个性化推荐（需登录）
export const getUserRecommend = () => request.get('/recommend/user');

// 记录用户行为（点击、收藏、评分等）
export const recordBehavior = (data) => request.post('/recommend/behavior', data);

// 获取热门推荐（无需登录）
export const getPopularRecommend = (params) => request.get('/recommend/popular', { params });
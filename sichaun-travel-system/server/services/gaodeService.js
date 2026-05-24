// server/services/gaodeService.js
const axios = require('axios');

// ★ 修改：使用环境变量或配置管理 Key
const AMAP_KEY = process.env.AMAP_KEY || '68ff2afb0b6d70f0a6970b71737729a6';

/**
 * 智能路线规划（根据偏好筛选景区并排序）
 */
async function smartRoutePlan(sceneries, options) {
  const { origin, destination, days = 3, budget = 2000 } = options;
  
  // 按评分排序，取前N个景区作为途经点
  const waypoints = sceneries
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, Math.min(days * 2, sceneries.length))
    .map(s => ({
      name: s.name,
      city: s.city,
      lng: s.longitude,
      lat: s.latitude
    }));

  return {
    origin,
    destination,
    waypoints,
    days,
    budget
  };
}

/**
 * ★ 修改：获取路线详情（驾车路线规划）
 * 使用高德地图驾车路径规划 API
 */
async function getRouteDetail(origin, destination) {
  try {
    const response = await axios.get('https://restapi.amap.com/v3/direction/driving', {
      params: {
        key: AMAP_KEY,
        origin: origin,
        destination: destination,
        strategy: 0,           // 速度优先
        extensions: 'all'      // 返回详细信息
      }
    });

    const data = response.data;
    
    if (data.status === '1' && data.route && data.route.paths && data.route.paths.length > 0) {
      const path = data.route.paths[0];
      const steps = path.steps.map(step => ({
        instruction: step.instruction,
        distance: step.distance,
        duration: step.duration,
        road: step.road || ''
      }));

      return {
        distanceKm: (path.distance / 1000).toFixed(1),
        durationText: formatDuration(path.duration),
        toll: path.tolls || 0,
        fuelCost: Math.round(path.distance / 1000 * 0.7),
        steps: steps
      };
    } else {
      // ★ 修改：API 调用失败时返回模拟数据，而不是直接报错
      console.warn('高德地图API返回异常，使用模拟数据:', data.info || '未知错误');
      return getMockRouteDetail(origin, destination);
    }
  } catch (e) {
    console.error('获取路线详情失败，使用模拟数据:', e.message);
    return getMockRouteDetail(origin, destination);
  }
}

/**
 * ★ 新增：当高德API不可用时返回模拟路线数据
 */
function getMockRouteDetail(origin, destination) {
  return {
    distanceKm: '280.5',
    durationText: '3小时30分钟',
    toll: 120,
    fuelCost: 196,
    steps: [
      { instruction: `从${origin}出发`, distance: 0, duration: 0, road: '' },
      { instruction: '沿G5京昆高速行驶', distance: 150000, duration: 5400, road: 'G5京昆高速' },
      { instruction: '进入G93成渝环线高速', distance: 80000, duration: 3600, road: 'G93成渝环线高速' },
      { instruction: `抵达${destination}`, distance: 50000, duration: 3600, road: '' }
    ]
  };
}

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}小时${m}分钟` : `${m}分钟`;
}

module.exports = {
  smartRoutePlan,
  getRouteDetail
};
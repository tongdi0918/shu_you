// server/services/gaodeService.js
const axios = require('axios');

const AMAP_KEY = process.env.AMAP_KEY || 'YOUR_AMAP_KEY_HERE';

/**
 * 智能路线规划（返回简单的景点排列）
 */
async function smartRoutePlan(sceneries, options) {
  const routes = [];
  for (let i = 0; i < sceneries.length; i++) {
    const scenic = sceneries[i];
    routes.push({
      day: Math.floor(i / 2) + 1,
      order: i + 1,
      type: 'scenery',
      name: scenic.name,
      city: scenic.city,
      longitude: scenic.longitude,
      latitude: scenic.latitude,
      ticketPrice: scenic.ticket_price,
      description: scenic.description
    });
  }
  return routes;
}

/**
 * 获取路线详情（公里数、预估时间、高速路费）
 * 修正：使用正确的高德 REST API 域名 restapi.amap.com
 */
async function getRouteDetail(origin, destination) {
  try {
    const response = await axios.get('https://restapi.amap.com/v3/direction/driving', {
      params: {
        key: AMAP_KEY,
        origin: origin,
        destination: destination,
        strategy: 0,
        extensions: 'all'
      }
    });

    if (response.data.status === '1' && response.data.route && response.data.route.paths) {
      const path = response.data.route.paths[0];
      const distance = path.distance;      // 米
      const duration = path.duration;      // 秒
      const toll = path.tolls || 0;
      const distanceKm = (distance / 1000).toFixed(1);
      const fuelCost = Math.round(distanceKm * 0.08 * 8);

      const steps = path.steps.map(step => ({
        instruction: step.instruction,
        distance: step.distance,
        duration: step.duration,
        road: step.road || '',
        tolls: step.tolls || 0
      }));

      return {
        distance: distance,
        distanceKm: distanceKm,
        duration: duration,
        durationText: formatDuration(duration),
        toll: toll,
        fuelCost: fuelCost,
        steps: steps
      };
    }

    // API 未返回数据时使用模拟数据
    return getSimulatedRouteDetail(origin, destination);
  } catch (e) {
    console.error('高德地图API调用失败:', e.message);
    return getSimulatedRouteDetail(origin, destination);
  }
}

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}小时${minutes}分钟`;
  return `${minutes}分钟`;
}

function getSimulatedRouteDetail(origin, destination) {
  const baseDistance = 150000;
  const randomFactor = 0.8 + Math.random() * 0.4;
  const distance = Math.round(baseDistance * randomFactor);
  const duration = Math.round(distance / 1000 * 60 * 1.2);
  const distanceKm = (distance / 1000).toFixed(1);
  const toll = Math.round(parseFloat(distanceKm) * 0.5);
  const fuelCost = Math.round(parseFloat(distanceKm) * 0.08 * 8);

  return {
    distance: distance,
    distanceKm: distanceKm,
    duration: duration,
    durationText: formatDuration(duration),
    toll: toll,
    fuelCost: fuelCost,
    steps: [
      {
        instruction: `从${origin}出发`,
        distance: distance * 0.3,
        duration: duration * 0.3,
        road: '城市道路'
      },
      {
        instruction: '进入高速公路',
        distance: distance * 0.5,
        duration: duration * 0.4,
        road: 'G5京昆高速',
        tolls: toll
      },
      {
        instruction: `抵达${destination}`,
        distance: distance * 0.2,
        duration: duration * 0.3,
        road: '城市道路'
      }
    ]
  };
}

module.exports = { smartRoutePlan, getRouteDetail };
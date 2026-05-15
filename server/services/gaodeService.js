// server/services/gaodeService.js
const axios = require('axios');
const GAODE_KEY = '68ff2afb0b6d70f0a6970b71737729a6'; // 需在高德开放平台申请

/**
 * 驾车路线规划：将多个景点串联为最优路线
 * @param {Array} waypoints - [{ longitude, latitude, name }]
 * @param {String} origin - 起点坐标 "lng,lat"
 * @param {String} destination - 终点坐标 "lng,lat"
 */
async function planDrivingRoute(waypoints, origin, destination) {
    if (waypoints.length === 0) {
        // 两点规划
        const url = `https://restapi.amap.com/v3/direction/driving?origin=${origin}&destination=${destination}&key=${GAODE_KEY}`;
        const res = await axios.get(url);
        return res.data;
    }
    // 多点途经
    const wpStr = waypoints.map(w => `${w.longitude},${w.latitude}`).join(';');
    const url = `https://restapi.amap.com/v3/direction/driving?origin=${origin}&destination=${destination}&waypoints=${wpStr}&key=${GAODE_KEY}`;
    const res = await axios.get(url);
    return res.data;
}

/**
 * 智能路线规划：根据用户偏好排序景点再规划路线
 * @param {Array} selectedSceneries - 已选的景点列表
 * @param {Object} userPrefs - { origin, days, budget }
 */
async function smartRoutePlan(selectedSceneries, userPrefs) {
    const { origin, days } = userPrefs;
    const sorted = selectedSceneries.sort((a, b) => b.rating - a.rating);
    const dailyPlan = Math.ceil(sorted.length / days);
    const dayRoutes = [];
    for (let i = 0; i < sorted.length; i += dailyPlan) {
        const dayGroup = sorted.slice(i, i + dailyPlan);
        if (dayGroup.length >= 2) {
            const wp = dayGroup.slice(1, -1);
            const route = await planDrivingRoute(
                wp,
                `${dayGroup[0].longitude},${dayGroup[0].latitude}`,
                `${dayGroup[dayGroup.length-1].longitude},${dayGroup[dayGroup.length-1].latitude}`
            );
            dayRoutes.push({ day: Math.floor(i/dailyPlan)+1, sceneries: dayGroup, route });
        }
    }
    return dayRoutes;
}

module.exports = { planDrivingRoute, smartRoutePlan };
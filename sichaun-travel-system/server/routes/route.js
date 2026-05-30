// server/routes/route.js
const express = require('express');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { smartRoutePlan, getRouteDetail, geocodeAddress } = require('../services/gaodeService');
const router = express.Router();

// 智能路线规划（需要登录）
router.post('/plan', authenticate, async (req, res) => {
  try {
    const { origin, destination, days, budget, preference } = req.body;
    const userId = req.user.id;

    if (!origin || !destination) {
      return res.status(400).json({ code: 400, msg: '请填写出发地和目的地' });
    }

    // ======= 对出发地和目的地进行地理编码 =======
    let originCoord, destCoord;
    try {
      // 如果用户输入的是地址文字，转换为经纬度坐标
      if (typeof origin === 'string' && origin.includes(',')) {
        const parts = origin.split(',');
        originCoord = `${parts[0].trim()},${parts[1].trim()}`;
      } else {
        const geoResult = await geocodeAddress(origin);
        originCoord = geoResult ? `${geoResult.lng},${geoResult.lat}` : origin;
      }
      
      if (typeof destination === 'string' && destination.includes(',')) {
        const parts = destination.split(',');
        destCoord = `${parts[0].trim()},${parts[1].trim()}`;
      } else {
        const geoResult = await geocodeAddress(destination);
        destCoord = geoResult ? `${geoResult.lng},${geoResult.lat}` : destination;
      }
    } catch (geoErr) {
      console.warn('地理编码失败，使用原始输入:', geoErr.message);
      originCoord = origin;
      destCoord = destination;
    }
    // ======= 地理编码结束 =======

    // 根据偏好筛选景区（原样保留）
    let scenicQuery = 'SELECT * FROM sceneries WHERE 1=1';
    const params = [];
    if (preference && preference.length > 0) {
      const conditions = preference.map(p => {
        switch (p) {
          case 'natural': return "tags LIKE '%自然风光%'";
          case 'culture': return "tags LIKE '%历史文化%' OR tags LIKE '%佛教文化%' OR tags LIKE '%道教圣地%'";
          case 'food': return "city IN ('成都市','乐山市','宜宾市')";
          case 'relax': return "tags LIKE '%休闲%' OR tags LIKE '%摄影圣地%'";
          case 'adventure': return "tags LIKE '%登山徒步%' OR tags LIKE '%高原%'";
          default: return '1=1';
        }
      });
      scenicQuery += ' AND (' + conditions.join(' OR ') + ')';
    }
    if (budget) {
      scenicQuery += ' AND ticket_price <= ?';
      params.push(budget * 0.4);
    }
    scenicQuery += ' ORDER BY rating DESC';
    const [sceneries] = await pool.query(scenicQuery, params);

    // 智能规划路线
    const routes = await smartRoutePlan(sceneries, { origin, destination, days, budget: budget || 2000 });

    // 获取路线详情（使用坐标）
    const routeDetail = await getRouteDetail(originCoord, destCoord);

    // 保存路线规划记录
    await pool.query(
      'INSERT INTO route_plans (user_id, origin, destination, waypoints, budget, duration, route_json) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        userId,
        origin,
        destination,
        JSON.stringify(sceneries.slice(0, 5).map(s => ({ name: s.name, lng: s.longitude, lat: s.latitude }))),
        budget || 2000,
        days || 3,
        JSON.stringify({ routes, routeDetail })
      ]
    );

    res.json({
      code: 200,
      data: {
        routes,
        routeDetail, // 包含 distance, duration, toll, steps 等信息
        sceneries: sceneries.slice(0, 5)
      }
    });
  } catch (e) {
    res.status(500).json({ code: 500, msg: e.message });
  }
});

// 获取用户历史路线规划（原样保留）
router.get('/history', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      'SELECT * FROM route_plans WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
      [userId]
    );
    res.json({ code: 200, data: rows });
  } catch (e) {
    res.status(500).json({ code: 500, msg: e.message });
  }
});

// 多地点顺序路线规划
router.post('/multi-point', authenticate, async (req, res) => {
  try {
    const { origin, destination, waypoints } = req.body;
    
    if (!origin || !destination) {
      return res.status(400).json({ code: 400, msg: '出发地和目的地不能为空' });
    }
    
    // 调用高德地图 API 进行路线规划
    const gaodeService = require('../services/gaodeService');
    const routeResult = await gaodeService.getDrivingRoute(origin, destination, waypoints);
    
    // 保存规划记录
    await pool.query(
      `INSERT INTO route_plans (user_id, origin, destination, waypoints, route_json) 
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, origin, destination, JSON.stringify(waypoints), JSON.stringify(routeResult)]
    );
    
    res.json({ code: 200, data: routeResult });
  } catch (e) {
    res.status(500).json({ code: 500, msg: e.message });
  }
});

module.exports = router;
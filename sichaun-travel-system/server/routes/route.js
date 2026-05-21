// server/routes/route.js
const express = require('express');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { smartRoutePlan } = require('../services/gaodeService');
const router = express.Router();

// 智能路线规划（需要登录）
router.post('/plan', authenticate, async (req, res) => {
    try {
        const { origin, days, budget, preference } = req.body;
        const userId = req.user.id;

        if (!origin || !days || !budget) {
            return res.status(400).json({ code: 400, msg: '请填写完整的规划参数' });
        }

        // 根据偏好筛选景区
        let scenicQuery = 'SELECT * FROM sceneries WHERE 1=1';
        const params = [];

        if (preference && preference.length > 0) {
            const conditions = preference.map(p => {
                switch (p) {
                    case 'natural':
                        return "tags LIKE '%自然风光%'";
                    case 'culture':
                        return "tags LIKE '%历史文化%' OR tags LIKE '%佛教文化%' OR tags LIKE '%道教圣地%'";
                    case 'food':
                        return "city IN ('成都市','乐山市','宜宾市')";
                    case 'relax':
                        return "tags LIKE '%休闲%' OR tags LIKE '%摄影圣地%'";
                    case 'adventure':
                        return "tags LIKE '%登山徒步%' OR tags LIKE '%高原%'";
                    default:
                        return '1=1';
                }
            });
            scenicQuery += ' AND (' + conditions.join(' OR ') + ')';
        }

        // 预算限制：门票价格不能超过预算的40%
        scenicQuery += ' AND ticket_price <= ?';
        params.push(budget * 0.4);

        scenicQuery += ' ORDER BY rating DESC';
        const [sceneries] = await pool.query(scenicQuery, params);

        if (sceneries.length < 2) {
            return res.json({
                code: 200,
                data: [],
                msg: '符合条件的景区不足，请调整偏好或预算'
            });
        }

        // 智能规划路线
        const routes = await smartRoutePlan(sceneries, { origin, days, budget });

        // 保存路线规划记录
        await pool.query(
            'INSERT INTO route_plans (user_id, origin, destination, waypoints, budget, duration, route_json) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                userId,
                origin,
                sceneries[sceneries.length - 1].name,
                JSON.stringify(sceneries.slice(1, -1).map(s => ({ name: s.name, lng: s.longitude, lat: s.latitude }))),
                budget,
                days,
                JSON.stringify(routes)
            ]
        );

        res.json({ code: 200, data: routes });
    } catch (e) {
        res.status(500).json({ code: 500, msg: e.message });
    }
});

// 获取用户历史路线规划
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

module.exports = router;
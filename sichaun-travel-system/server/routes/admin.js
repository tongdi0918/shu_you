// server/routes/admin.js
const express = require('express');
const pool = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// 所有管理端接口都需要管理员权限
router.use(authenticate, requireAdmin);

// ============ 景区管理 ============

// 获取所有景区（管理端）
router.get('/sceneries', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM sceneries ORDER BY id DESC');
        res.json({ code: 200, data: rows });
    } catch (e) {
        res.status(500).json({ code: 500, msg: e.message });
    }
});

// 新增景区
router.post('/sceneries', async (req, res) => {
    try {
        const { name, city, level, description, image_url, longitude, latitude, ticket_price, opening_hours, season_best, tags, rating } = req.body;

        if (!name || !city) {
            return res.status(400).json({ code: 400, msg: '景区名称和城市为必填项' });
        }

        const [result] = await pool.query(
            'INSERT INTO sceneries (name, city, level, description, image_url, longitude, latitude, ticket_price, opening_hours, season_best, tags, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, city, level || '4A', description, image_url, longitude, latitude, ticket_price, opening_hours, season_best, tags, rating || 4.5]
        );

        res.json({ code: 200, msg: '景区新增成功', data: { id: result.insertId } });
    } catch (e) {
        res.status(500).json({ code: 500, msg: e.message });
    }
});

// 更新景区
router.put('/sceneries/:id', async (req, res) => {
    try {
        const { name, city, level, description, image_url, longitude, latitude, ticket_price, opening_hours, season_best, tags, rating } = req.body;

        const [result] = await pool.query(
            'UPDATE sceneries SET name=?, city=?, level=?, description=?, image_url=?, longitude=?, latitude=?, ticket_price=?, opening_hours=?, season_best=?, tags=?, rating=? WHERE id=?',
            [name, city, level, description, image_url, longitude, latitude, ticket_price, opening_hours, season_best, tags, rating, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ code: 404, msg: '景区不存在' });
        }

        res.json({ code: 200, msg: '景区更新成功' });
    } catch (e) {
        res.status(500).json({ code: 500, msg: e.message });
    }
});

// 删除景区
router.delete('/sceneries/:id', async (req, res) => {
    try {
        // 删除相关的预警数据
        await pool.query('DELETE FROM warnings WHERE scenic_id = ?', [req.params.id]);

        const [result] = await pool.query('DELETE FROM sceneries WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ code: 404, msg: '景区不存在' });
        }

        res.json({ code: 200, msg: '景区删除成功' });
    } catch (e) {
        res.status(500).json({ code: 500, msg: e.message });
    }
});

// ============ 美食管理 ============

// 获取所有美食
router.get('/foods', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM foods ORDER BY id DESC');
        res.json({ code: 200, data: rows });
    } catch (e) {
        res.status(500).json({ code: 500, msg: e.message });
    }
});

// 新增美食
router.post('/foods', async (req, res) => {
    try {
        const { name, city, category, description, image_url, longitude, latitude, avg_price, tags, rating } = req.body;

        if (!name || !city) {
            return res.status(400).json({ code: 400, msg: '美食名称和城市为必填项' });
        }

        const [result] = await pool.query(
            'INSERT INTO foods (name, city, category, description, image_url, longitude, latitude, avg_price, tags, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, city, category, description, image_url, longitude, latitude, avg_price, tags, rating || 4.5]
        );

        res.json({ code: 200, msg: '美食新增成功', data: { id: result.insertId } });
    } catch (e) {
        res.status(500).json({ code: 500, msg: e.message });
    }
});

// 更新美食
router.put('/foods/:id', async (req, res) => {
    try {
        const { name, city, category, description, image_url, longitude, latitude, avg_price, tags, rating } = req.body;

        const [result] = await pool.query(
            'UPDATE foods SET name=?, city=?, category=?, description=?, image_url=?, longitude=?, latitude=?, avg_price=?, tags=?, rating=? WHERE id=?',
            [name, city, category, description, image_url, longitude, latitude, avg_price, tags, rating, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ code: 404, msg: '美食不存在' });
        }

        res.json({ code: 200, msg: '美食更新成功' });
    } catch (e) {
        res.status(500).json({ code: 500, msg: e.message });
    }
});

// 删除美食
router.delete('/foods/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM foods WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ code: 404, msg: '美食不存在' });
        }

        res.json({ code: 200, msg: '美食删除成功' });
    } catch (e) {
        res.status(500).json({ code: 500, msg: e.message });
    }
});

// ============ 数据统计 ============

// 获取系统统计数据
router.get('/stats', async (req, res) => {
    try {
        const [
            [userCount],
            [scenicCount],
            [foodCount],
            [behaviorCount],
            [warningCount]
        ] = await Promise.all([
            pool.query('SELECT COUNT(*) as count FROM users'),
            pool.query('SELECT COUNT(*) as count FROM sceneries'),
            pool.query('SELECT COUNT(*) as count FROM foods'),
            pool.query('SELECT COUNT(*) as count FROM user_behaviors'),
            pool.query('SELECT COUNT(*) as count FROM warnings WHERE congestion_level = "high"')
        ]);

        // 获取热门景区 Top5
        const [topSceneries] = await pool.query(
            'SELECT name, rating FROM sceneries ORDER BY rating DESC LIMIT 5'
        );

        // 获取各城市景区分布
        const [cityDistribution] = await pool.query(
            'SELECT city, COUNT(*) as count FROM sceneries GROUP BY city ORDER BY count DESC'
        );

        res.json({
            code: 200,
            data: {
                userCount: userCount[0].count,
                scenicCount: scenicCount[0].count,
                foodCount: foodCount[0].count,
                behaviorCount: behaviorCount[0].count,
                highWarningCount: warningCount[0].count,
                topSceneries,
                cityDistribution
            }
        });
    } catch (e) {
        res.status(500).json({ code: 500, msg: e.message });
    }
});

module.exports = router;
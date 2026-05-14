// server/routes/food.js
const express = require('express');
const pool = require('../config/db');
const router = express.Router();

// 获取所有美食
router.get('/list', async (req, res) => {
    try {
        const { page = 1, pageSize = 20, city, category, keyword } = req.query;
        let sql = 'SELECT * FROM foods WHERE 1=1';
        const params = [];

        if (city) {
            sql += ' AND city LIKE ?';
            params.push(`%${city}%`);
        }
        if (category) {
            sql += ' AND category = ?';
            params.push(category);
        }
        if (keyword) {
            sql += ' AND (name LIKE ? OR description LIKE ? OR tags LIKE ?)';
            params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
        }

        sql += ' ORDER BY rating DESC';
        const offset = (page - 1) * pageSize;
        sql += ` LIMIT ${parseInt(pageSize)} OFFSET ${offset}`;

        const [rows] = await pool.query(sql, params);

        // 获取总数
        let countSQL = 'SELECT COUNT(*) as total FROM foods WHERE 1=1';
        if (city) countSQL += ' AND city LIKE ?';
        if (category) countSQL += ' AND category = ?';
        if (keyword) countSQL += ' AND (name LIKE ? OR description LIKE ? OR tags LIKE ?)';
        const countParams = params.slice(0, params.length > 3 ? 3 : params.length);
        const [countResult] = await pool.query(countSQL, countParams);

        res.json({
            code: 200,
            data: rows,
            pagination: {
                page: parseInt(page),
                pageSize: parseInt(pageSize),
                total: countResult[0].total
            }
        });
    } catch (e) {
        res.status(500).json({ code: 500, msg: e.message });
    }
});

// 获取美食详情
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM foods WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ code: 404, msg: '美食不存在' });
        }
        res.json({ code: 200, data: rows[0] });
    } catch (e) {
        res.status(500).json({ code: 500, msg: e.message });
    }
});

// 获取美食分类列表
router.get('/categories/list', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT DISTINCT category FROM foods WHERE category IS NOT NULL ORDER BY category'
        );
        res.json({ code: 200, data: rows.map(r => r.category) });
    } catch (e) {
        res.status(500).json({ code: 500, msg: e.message });
    }
});

module.exports = router;
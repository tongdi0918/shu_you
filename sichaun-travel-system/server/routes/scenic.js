// sichaun-travel-system/server/routes/scenic.js
const express = require('express');
const pool = require('../config/db');
const router = express.Router();

// 获取所有景区（支持城市、等级筛选）
router.get('/', async (req, res) => {
  try {
    const { city, level, keyword, limit = 20 } = req.query;
    let sql = 'SELECT * FROM sceneries WHERE 1=1';
    const params = [];

    if (city) {
      sql += ' AND city = ?';
      params.push(city);
    }
    if (level) {
      sql += ' AND level = ?';
      params.push(level);
    }
    if (keyword) {
      sql += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    sql += ' ORDER BY rating DESC LIMIT ?';
    params.push(parseInt(limit));

    const [rows] = await pool.query(sql, params);
    res.json({ code: 200, data: rows });
  } catch (e) {
    res.status(500).json({ code: 500, msg: e.message });
  }
});

// 获取单个景区详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM sceneries WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ code: 404, msg: '景区不存在' });
    }
    res.json({ code: 200, data: rows[0] });
  } catch (e) {
    res.status(500).json({ code: 500, msg: e.message });
  }
});

module.exports = router;
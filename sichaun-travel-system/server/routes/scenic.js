// server/routes/scenic.js
const express = require('express');
const pool = require('../config/db');
const router = express.Router();

// 获取所有景区（支持分页、搜索、筛选）
router.get('/list', async (req, res) => {
  try {
    const { page = 1, pageSize = 20, city, level, keyword } = req.query;
    let sql = 'SELECT * FROM sceneries WHERE 1=1';
    const params = [];
    if (city) {
      sql += ' AND city LIKE ?';
      params.push(`%${city}%`);
    }
    if (level) {
      sql += ' AND level = ?';
      params.push(level);
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
    let countSQL = 'SELECT COUNT(*) as total FROM sceneries WHERE 1=1';
    if (city) countSQL += ' AND city LIKE ?';
    if (level) countSQL += ' AND level = ?';
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

// 【新增】随机获取景区
router.get('/random', async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    const sql = `SELECT * FROM sceneries ORDER BY RAND() LIMIT ${parseInt(limit)}`;
    const [rows] = await pool.query(sql);
    res.json({ code: 200, data: rows });
  } catch (e) {
    res.status(500).json({ code: 500, msg: e.message });
  }
});

// 获取单个景区详情
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM sceneries WHERE id = ?', [
      req.params.id
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ code: 404, msg: '景区不存在' });
    }
    // 同时获取该景区的预警信息
    const [warnings] = await pool.query(
      'SELECT * FROM warnings WHERE scenic_id = ? ORDER BY updated_at DESC LIMIT 1',
      [req.params.id]
    );
    res.json({
      code: 200,
      data: { ...rows[0], warning: warnings.length > 0 ? warnings[0] : null }
    });
  } catch (e) {
    res.status(500).json({ code: 500, msg: e.message });
  }
});

// 获取景区城市列表（用于筛选）
router.get('/cities/list', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT DISTINCT city FROM sceneries ORDER BY city'
    );
    res.json({ code: 200, data: rows.map(r => r.city) });
  } catch (e) {
    res.status(500).json({ code: 500, msg: e.message });
  }
});

module.exports = router;
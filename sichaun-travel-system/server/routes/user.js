// server/routes/user.js
const express = require('express');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// ===== 用户个人信息 =====
// 获取个人信息
router.get('/profile', authenticate, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, username, phone, avatar, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!users.length) return res.status(404).json({ code: 404, msg: '用户不存在' });
    res.json({ code: 200, data: users[0] });
  } catch (e) {
    res.status(500).json({ code: 500, msg: e.message });
  }
});

// 更新个人信息
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { phone, avatar } = req.body;
    await pool.query('UPDATE users SET phone = ?, avatar = ? WHERE id = ?', 
      [phone || null, avatar || null, req.user.id]
    );
    res.json({ code: 200, msg: '个人信息更新成功' });
  } catch (e) {
    res.status(500).json({ code: 500, msg: e.message });
  }
});

// ===== 用户收藏 =====
// 获取我的收藏
router.get('/favorites', authenticate, async (req, res) => {
  try {
    const { type } = req.query;
    let sql = `
      SELECT f.id as fav_id, f.item_type, f.item_id, f.created_at as fav_time,
             COALESCE(s.name, fd.name) as item_name,
             COALESCE(s.city, fd.city) as item_city,
             COALESCE(s.image_url, fd.image_url) as item_image,
             COALESCE(s.rating, fd.rating) as item_rating,
             COALESCE(s.ticket_price, fd.avg_price) as item_price
      FROM favorites f
      LEFT JOIN sceneries s ON f.item_type = 'scenery' AND f.item_id = s.id
      LEFT JOIN foods fd ON f.item_type = 'food' AND f.item_id = fd.id
      WHERE f.user_id = ?
    `;
    const params = [req.user.id];
    if (type && ['scenery', 'food'].includes(type)) {
      sql += ' AND f.item_type = ?';
      params.push(type);
    }
    sql += ' ORDER BY f.created_at DESC';
    const [rows] = await pool.query(sql, params);
    res.json({ code: 200, data: rows });
  } catch (e) {
    res.status(500).json({ code: 500, msg: e.message });
  }
});

// 添加收藏
router.post('/favorites', authenticate, async (req, res) => {
  try {
    const { itemType, itemId } = req.body;
    if (!itemType || !itemId) {
      return res.status(400).json({ code: 400, msg: '参数不完整' });
    }
    await pool.query(
      'INSERT IGNORE INTO favorites (user_id, item_type, item_id) VALUES (?, ?, ?)',
      [req.user.id, itemType, itemId]
    );
    res.json({ code: 200, msg: '收藏成功' });
  } catch (e) {
    res.status(500).json({ code: 500, msg: e.message });
  }
});

// 取消收藏
router.delete('/favorites/:id', authenticate, async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM favorites WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ code: 404, msg: '收藏记录不存在' });
    }
    res.json({ code: 200, msg: '已取消收藏' });
  } catch (e) {
    res.status(500).json({ code: 500, msg: e.message });
  }
});

// ===== 浏览历史 =====
// 获取浏览历史
router.get('/history', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT bh.id, bh.item_type, bh.item_id, bh.created_at as view_time,
             COALESCE(s.name, fd.name) as item_name,
             COALESCE(s.city, fd.city) as item_city,
             COALESCE(s.image_url, fd.image_url) as item_image
      FROM browse_history bh
      LEFT JOIN sceneries s ON bh.item_type = 'scenery' AND bh.item_id = s.id
      LEFT JOIN foods fd ON bh.item_type = 'food' AND bh.item_id = fd.id
      WHERE bh.user_id = ?
      ORDER BY bh.created_at DESC
      LIMIT 50
    `, [req.user.id]);
    res.json({ code: 200, data: rows });
  } catch (e) {
    res.status(500).json({ code: 500, msg: e.message });
  }
});

// 记录浏览（页面打开时调用）
router.post('/history', authenticate, async (req, res) => {
  try {
    const { itemType, itemId } = req.body;
    if (!itemType || !itemId) {
      return res.status(400).json({ code: 400, msg: '参数不完整' });
    }
    await pool.query(
      'INSERT INTO browse_history (user_id, item_type, item_id) VALUES (?, ?, ?)',
      [req.user.id, itemType, itemId]
    );
    res.json({ code: 200, msg: '浏览记录已保存' });
  } catch (e) {
    res.status(500).json({ code: 500, msg: e.message });
  }
});

module.exports = router;
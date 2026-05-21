// sichaun-travel-system/server/routes/user.js
const express = require('express');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// ============ 个人信息相关 ============

// 获取个人信息
router.get('/profile', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    // 注意：这里 SELECT * 包含了 avatar 字段，数据库 users 表确实有 avatar 列
    // 如果仍报错 Unknown column 'avatar'，请确认数据库中 users 表结构正确
    const [rows] = await pool.query(
      'SELECT id, username, phone, avatar, role, created_at FROM users WHERE id = ?',
      [userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ code: 404, msg: '用户不存在' });
    }
    res.json({ code: 200, data: rows[0] });
  } catch (e) {
    res.status(500).json({ code: 500, msg: e.message });
  }
});

// 更新个人信息
router.put('/profile', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, phone, avatar } = req.body;
    await pool.query(
      'UPDATE users SET username = ?, phone = ?, avatar = ? WHERE id = ?',
      [username, phone, avatar, userId]
    );
    res.json({ code: 200, msg: '个人信息更新成功' });
  } catch (e) {
    res.status(500).json({ code: 500, msg: e.message });
  }
});

// ============ 收藏相关（修复 fd.avg_price 错误） ============

// 获取用户收藏列表
router.get('/favorites', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    // 修复：使用 UNION ALL 分别查询景区和美食收藏，避免 JOIN 别名错误
    const [rows] = await pool.query(`
      SELECT 
        f.id AS fav_id,
        f.item_type,
        f.item_id,
        f.created_at AS fav_time,
        CASE 
          WHEN f.item_type = 'scenery' THEN s.name
          WHEN f.item_type = 'food' THEN fd.name
        END AS item_name,
        CASE 
          WHEN f.item_type = 'scenery' THEN s.image_url
          WHEN f.item_type = 'food' THEN fd.image_url
        END AS item_image,
        CASE 
          WHEN f.item_type = 'scenery' THEN s.city
          WHEN f.item_type = 'food' THEN fd.city
        END AS item_city,
        CASE 
          WHEN f.item_type = 'scenery' THEN s.rating
          WHEN f.item_type = 'food' THEN fd.rating
        END AS item_rating,
        CASE 
          WHEN f.item_type = 'scenery' THEN s.ticket_price
          WHEN f.item_type = 'food' THEN fd.avg_price
        END AS item_price
      FROM favorites f
      LEFT JOIN sceneries s ON f.item_type = 'scenery' AND f.item_id = s.id
      LEFT JOIN foods fd ON f.item_type = 'food' AND f.item_id = fd.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `, [userId]);
    res.json({ code: 200, data: rows });
  } catch (e) {
    res.status(500).json({ code: 500, msg: e.message });
  }
});

// 添加收藏
router.post('/favorites', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemType, itemId } = req.body;
    if (!itemType || !itemId) {
      return res.status(400).json({ code: 400, msg: '参数不完整' });
    }
    // 检查是否已收藏
    const [existing] = await pool.query(
      'SELECT id FROM favorites WHERE user_id = ? AND item_type = ? AND item_id = ?',
      [userId, itemType, itemId]
    );
    if (existing.length > 0) {
      return res.json({ code: 200, msg: '已经收藏过了' });
    }
    await pool.query(
      'INSERT INTO favorites (user_id, item_type, item_id) VALUES (?, ?, ?)',
      [userId, itemType, itemId]
    );
    res.json({ code: 200, msg: '收藏成功' });
  } catch (e) {
    res.status(500).json({ code: 500, msg: e.message });
  }
});

// 取消收藏
router.delete('/favorites/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const itemId = req.params.id;
    const { type } = req.query; // scenery 或 food
    if (!type) {
      return res.status(400).json({ code: 400, msg: '请指定类型' });
    }
    await pool.query(
      'DELETE FROM favorites WHERE user_id = ? AND item_type = ? AND item_id = ?',
      [userId, type, itemId]
    );
    res.json({ code: 200, msg: '取消收藏成功' });
  } catch (e) {
    res.status(500).json({ code: 500, msg: e.message });
  }
});


// 获取用户旅行成就
router.get('/achievements', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    // 统计浏览过的景区（唯一，来自 browse_history）
    const [scenicRows] = await pool.query(
      `SELECT DISTINCT s.id, s.name FROM browse_history bh
       JOIN sceneries s ON bh.item_type = 'scenery' AND bh.item_id = s.id
       WHERE bh.user_id = ?`,
      [userId]
    );

    // 统计浏览过的美食
    const [foodRows] = await pool.query(
      `SELECT DISTINCT f.id, f.name FROM browse_history bh
       JOIN foods f ON bh.item_type = 'food' AND bh.item_id = f.id
       WHERE bh.user_id = ?`,
      [userId]
    );

    // 可选：累计路程（若有记录）
    const scenicList = scenicRows.map(r => r.name);
    const foodList = foodRows.map(r => r.name);

    res.json({
      code: 200,
      data: {
        scenicCount: scenicRows.length,
        scenicList,
        foodCount: foodRows.length,
        foodList,
        totalDistance: null // 可扩展
      }
    });
  } catch (e) {
    res.status(500).json({ code: 500, msg: e.message });
  }
});


// ============ 浏览历史 ============

router.get('/history', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(`
      SELECT 
        bh.id,
        bh.item_type,
        bh.item_id,
        bh.created_at,
        CASE 
          WHEN bh.item_type = 'scenery' THEN s.name
          WHEN bh.item_type = 'food' THEN fd.name
        END AS item_name,
        CASE 
          WHEN bh.item_type = 'scenery' THEN s.image_url
          WHEN bh.item_type = 'food' THEN fd.image_url
        END AS item_image
      FROM browse_history bh
      LEFT JOIN sceneries s ON bh.item_type = 'scenery' AND bh.item_id = s.id
      LEFT JOIN foods fd ON bh.item_type = 'food' AND bh.item_id = fd.id
      WHERE bh.user_id = ?
      ORDER BY bh.created_at DESC
      LIMIT 20
    `, [userId]);
    res.json({ code: 200, data: rows });
  } catch (e) {
    res.status(500).json({ code: 500, msg: e.message });
  }
});

router.post('/history', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemType, itemId } = req.body;
    if (!itemType || !itemId) {
      return res.status(400).json({ code: 400, msg: '参数不完整' });
    }
    if (!['scenery', 'food'].includes(itemType)) {
      return res.status(400).json({ code: 400, msg: '物品类型无效' });
    }
    // 不重复记录短时间内相同项目（可自行调整，此处简单插入）
    await pool.query(
      'INSERT INTO browse_history (user_id, item_type, item_id) VALUES (?, ?, ?)',
      [userId, itemType, itemId]
    );
    res.json({ code: 200, msg: '浏览记录已保存' });
  } catch (e) {
    res.status(500).json({ code: 500, msg: e.message });
  }
});



module.exports = router;
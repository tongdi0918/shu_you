// server/routes/recommend.js
const express = require('express');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { getUserBasedRecommendations, generateSmartItinerary } = require('../services/recommendService');
const router = express.Router();

// 获取用户个性化推荐（需要登录）
router.get('/user', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // ★ 修改：并行获取景区、美食推荐和行程规划
    const [sceneryRecommend, foodRecommend, itinerary] = await Promise.all([
      getUserBasedRecommendations(userId, 'scenery', 10),
      getUserBasedRecommendations(userId, 'food', 10),
      generateSmartItinerary(userId)
    ]);
    
    res.json({
      code: 200,
      data: {
        scenery: sceneryRecommend,
        food: foodRecommend,
        itinerary: itinerary,  // ★ 新增：返回行程规划
        userId: userId
      }
    });
  } catch (e) {
    res.status(500).json({ code: 500, msg: e.message });
  }
});

// 记录用户行为（用于训练推荐模型）
router.post('/behavior', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemType, itemId, action, rating } = req.body;
    
    if (!itemType || !itemId || !action) {
      return res.status(400).json({ code: 400, msg: '参数不完整' });
    }
    if (!['scenery', 'food'].includes(itemType)) {
      return res.status(400).json({ code: 400, msg: '物品类型无效' });
    }
    if (!['view', 'like', 'bookmark', 'rate'].includes(action)) {
      return res.status(400).json({ code: 400, msg: '行为类型无效' });
    }
    
    await pool.query(
      'INSERT INTO user_behaviors (user_id, item_type, item_id, action, rating) VALUES (?, ?, ?, ?, ?)',
      [userId, itemType, itemId, action, rating || 0]
    );
    
    res.json({ code: 200, msg: '行为记录成功' });
  } catch (e) {
    res.status(500).json({ code: 500, msg: e.message });
  }
});

// 获取热门推荐（无需登录，用于冷启动）
router.get('/popular', async (req, res) => {
  try {
    const { type = 'scenery', limit = 10 } = req.query;
    const table = type === 'scenery' ? 'sceneries' : 'foods';
    const [rows] = await pool.query(
      `SELECT * FROM ${table} ORDER BY rating DESC LIMIT ?`,
      [parseInt(limit)]
    );
    res.json({ code: 200, data: rows });
  } catch (e) {
    res.status(500).json({ code: 500, msg: e.message });
  }
});

module.exports = router;
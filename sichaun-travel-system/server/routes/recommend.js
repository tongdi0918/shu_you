// sichaun-travel-system/server/routes/recommend.js
const express = require('express');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { getUserBasedRecommendations } = require('../services/recommendService');
const router = express.Router();

// 获取用户个性化推荐（需要登录）
router.get('/user', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const [sceneryRecommend, foodRecommend] = await Promise.all([
      getUserBasedRecommendations(userId, 'scenery', 10),
      getUserBasedRecommendations(userId, 'food', 10)
    ]);
    res.json({
      code: 200,
      data: {
        scenery: sceneryRecommend,
        food: foodRecommend,
        userId: userId
      }
    });
  } catch (e) {
    res.status(500).json({ code: 500, msg: e.message });
  }
});

// ========== 新增：随机刷新推荐（"换一批"功能） ==========
router.get('/refresh', authenticate, async (req, res) => {
  try {
    const { type = 'scenery', exclude = '', limit = 6 } = req.query;
    const table = type === 'scenery' ? 'sceneries' : 'foods';
    let sql = `SELECT * FROM ${table} WHERE 1=1`;
    const params = [];
    
    // 排除已显示的项
    if (exclude) {
      const excludeIds = exclude.split(',').map(Number).filter(Boolean);
      if (excludeIds.length > 0) {
        sql += ` AND id NOT IN (${excludeIds.map(() => '?').join(',')})`;
        params.push(...excludeIds);
      }
    }
    
    sql += ' ORDER BY RAND() LIMIT ?';
    params.push(parseInt(limit));
    
    const [rows] = await pool.query(sql, params);
    
    // 生成推荐依据
    const reasons = generateRecommendReasons(rows, type);
    
    res.json({ code: 200, data: rows, reasons });
  } catch (e) {
    res.status(500).json({ code: 500, msg: e.message });
  }
});

// ========== 生成推荐依据（体现吸引力） ==========
function generateRecommendReasons(items, type) {
  const reasons = {};
  items.forEach(item => {
    const reasonList = [];
    
    if (item.rating >= 4.8) {
      reasonList.push('⭐ 口碑爆棚，评分高达 ' + item.rating);
    } else if (item.rating >= 4.5) {
      reasonList.push('👍 好评如潮，深受游客喜爱');
    } else if (item.rating >= 4.0) {
      reasonList.push('👌 品质有保证，值得一试');
    }
    
    if (type === 'scenery') {
      if (item.level === '5A') reasonList.push('🏆 国家5A级景区');
      if (item.tags && item.tags.includes('世界遗产')) reasonList.push('🌍 世界遗产地');
      if (item.tags && item.tags.includes('自然风光')) reasonList.push('🏞️ 自然风光绝美');
      if (item.tags && item.tags.includes('历史文化')) reasonList.push('📜 历史文化深厚');
      if (item.ticket_price <= 100) reasonList.push('💰 门票实惠，性价比高');
      if (item.season_best) reasonList.push('🌸 最佳游玩季节：' + item.season_best);
    } else {
      if (item.tags && item.tags.includes('非遗')) reasonList.push('🏛️ 非物质文化遗产');
      if (item.tags && item.tags.includes('百年老店')) reasonList.push('🏠 百年老店传承');
      if (item.avg_price <= 30) reasonList.push('💰 人均不到30元，超实惠');
      if (item.tags && item.tags.includes('网红')) reasonList.push('🔥 网红打卡美食');
    }
    
    if (reasonList.length === 0) {
      reasonList.push('🎯 根据您的偏好智能推荐');
    }
    
    reasons[item.id] = reasonList;
  });
  return reasons;
}

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
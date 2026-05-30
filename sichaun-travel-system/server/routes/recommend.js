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


// 获取按城市分组的景区与美食
router.get('/grouped-by-city', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 并行获取景区和美食数据
    const [sceneries, foods] = await Promise.all([
      pool.query('SELECT * FROM sceneries ORDER BY city, rating DESC'),
      pool.query('SELECT * FROM foods ORDER BY city, rating DESC')
    ]);
    
    // 按城市分组
    const groupedData = {};
    
    // 处理景区
    sceneries[0].forEach(scenery => {
      if (!groupedData[scenery.city]) {
        groupedData[scenery.city] = { sceneries: [], foods: [] };
      }
      groupedData[scenery.city].sceneries.push(scenery);
    });
    
    // 处理美食
    foods[0].forEach(food => {
      if (!groupedData[food.city]) {
        groupedData[food.city] = { sceneries: [], foods: [] };
      }
      groupedData[food.city].foods.push(food);
    });
    
    res.json({ code: 200, data: groupedData });
  } catch (e) {
    res.status(500).json({ code: 500, msg: e.message });
  }
});

// 基于用户选择的景区与美食生成规划
router.post('/custom-plan', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { selectedSceneries, selectedFoods, currentCity } = req.body;
    
    if ((!selectedSceneries || selectedSceneries.length === 0) && 
        (!selectedFoods || selectedFoods.length === 0)) {
      return res.status(400).json({ code: 400, msg: '请至少选择一个景点或美食' });
    }
    
    // 获取景区详情
    let sceneryDetails = [];
    if (selectedSceneries && selectedSceneries.length > 0) {
      const placeholders = selectedSceneries.map(() => '?').join(',');
      const [sceneries] = await pool.query(
        `SELECT id, name, city, latitude, longitude, description, image_url, rating 
         FROM sceneries WHERE id IN (${placeholders})`,
        selectedSceneries
      );
      sceneryDetails = sceneries;
    }
    
    // 获取美食详情
    let foodDetails = [];
    if (selectedFoods && selectedFoods.length > 0) {
      const placeholders = selectedFoods.map(() => '?').join(',');
      const [foods] = await pool.query(
        `SELECT id, name, city, latitude, longitude, description, image_url, rating 
         FROM foods WHERE id IN (${placeholders})`,
        selectedFoods
      );
      foodDetails = foods;
    }
    
    // 合并并排序：按城市分组，同一城市的景区和美食排列在一起
    const allItems = [...sceneryDetails, ...foodDetails];
    const groupedItems = {};
    allItems.forEach(item => {
      if (!groupedItems[item.city]) {
        groupedItems[item.city] = [];
      }
      groupedItems[item.city].push({
        ...item,
        type: sceneryDetails.some(s => s.id === item.id) ? 'scenery' : 'food'
      });
    });
    
    // 规划路线：按城市分组，同一城市内先景区后美食
    const itinerary = [];
    for (const city in groupedItems) {
      // 同一城市内排序：景区在前，美食在后
      const sceneriesInCity = groupedItems[city].filter(i => i.type === 'scenery');
      const foodsInCity = groupedItems[city].filter(i => i.type === 'food');
      const sortedItems = [...sceneriesInCity, ...foodsInCity];
      itinerary.push(...sortedItems);
    }
    
    // 更新用户行为记录（记录用户选择）
    const itemsToRecord = [...sceneryDetails, ...foodDetails];
    for (const item of itemsToRecord) {
      const itemType = sceneryDetails.some(s => s.id === item.id) ? 'scenery' : 'food';
      await pool.query(
        `INSERT INTO user_behaviors (user_id, item_type, item_id, action, is_visit) 
         VALUES (?, ?, ?, 'like', 1) 
         ON DUPLICATE KEY UPDATE is_visit = 1`,
        [userId, itemType, item.id]
      );
    }
    
    // 更新用户当前位置
    if (currentCity) {
      await pool.query(
        'UPDATE users SET current_city = ? WHERE id = ?',
        [currentCity, userId]
      );
    }
    
    res.json({ code: 200, data: { itinerary, groupedItems } });
  } catch (e) {
    res.status(500).json({ code: 500, msg: e.message });
  }
});

module.exports = router;
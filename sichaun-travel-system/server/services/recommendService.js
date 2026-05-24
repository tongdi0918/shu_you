// server/services/recommendService.js
const pool = require('../config/db');

/**
 * ★ 修改：增强版用户推荐服务
 * 根据用户的收藏记录和浏览历史，使用协同过滤思想进行推荐
 */
async function getUserBasedRecommendations(userId, type, limit = 10) {
  try {
    const table = type === 'scenery' ? 'sceneries' : 'foods';
    const behaviorTable = 'user_behaviors';
    
    // 1. 获取用户收藏和浏览的物品ID
    const [userBehaviors] = await pool.query(
      `SELECT item_id, action, COUNT(*) as count 
       FROM ${behaviorTable} 
       WHERE user_id = ? AND item_type = ? 
       AND action IN ('like', 'bookmark', 'view')
       GROUP BY item_id, action
       ORDER BY count DESC`,
      [userId, type]
    );

    // 2. 如果用户有行为记录，获取相似物品
    if (userBehaviors.length > 0) {
      const likedIds = userBehaviors
        .filter(b => b.action === 'like' || b.action === 'bookmark')
        .map(b => b.item_id);
      
      const viewedIds = userBehaviors
        .filter(b => b.action === 'view')
        .map(b => b.item_id);

      // 获取用户喜欢物品的标签
      if (likedIds.length > 0) {
        const [likedItems] = await pool.query(
          `SELECT id, tags, city FROM ${table} WHERE id IN (?)`,
          [likedIds]
        );

        // 提取标签和城市偏好
        const allTags = new Set();
        const cities = new Set();
        likedItems.forEach(item => {
          if (item.tags) {
            item.tags.split(',').forEach(tag => allTags.add(tag.trim()));
          }
          if (item.city) cities.add(item.city);
        });

        // 基于标签和城市推荐相似物品
        let query = `SELECT * FROM ${table} WHERE id NOT IN (?)`;
        const params = [likedIds.concat(viewedIds)];
        
        if (allTags.size > 0) {
          const tagConditions = Array.from(allTags).map(() => 'tags LIKE ?');
          query += ` AND (${tagConditions.join(' OR ')})`;
          Array.from(allTags).forEach(tag => params.push(`%${tag}%`));
        }
        
        if (cities.size > 0) {
          const cityConditions = Array.from(cities).map(() => 'city = ?');
          query += ` OR (${cityConditions.join(' OR ')})`;
          Array.from(cities).forEach(city => params.push(city));
        }
        
        query += ` ORDER BY rating DESC LIMIT ?`;
        params.push(limit);

        const [recommendations] = await pool.query(query, params);
        
        // 计算预测评分
        return recommendations.map(item => ({
          ...item,
          predictedRating: calculatePredictedRating(item, likedItems, userBehaviors)
        }));
      }
    }

    // 3. 冷启动：返回热门物品
    const [popular] = await pool.query(
      `SELECT * FROM ${table} ORDER BY rating DESC LIMIT ?`,
      [limit]
    );
    
    return popular.map(item => ({
      ...item,
      predictedRating: Math.round(item.rating * 10) || 80
    }));
  } catch (e) {
    console.error(`推荐服务错误 (${type}):`, e);
    // 出错时返回空数组，不中断流程
    return [];
  }
}

/**
 * ★ 新增：计算预测评分
 */
function calculatePredictedRating(item, likedItems, userBehaviors) {
  let score = 70; // 基础分
  
  // 与喜欢物品的标签相似度加分
  if (item.tags && likedItems.length > 0) {
    const itemTags = item.tags.split(',');
    likedItems.forEach(liked => {
      if (liked.tags) {
        const likedTags = liked.tags.split(',');
        const commonTags = itemTags.filter(t => likedTags.includes(t));
        score += commonTags.length * 5;
      }
    });
  }
  
  // 基于评分加分
  if (item.rating) {
    score += (item.rating / 5) * 10;
  }
  
  return Math.min(Math.round(score), 99);
}

/**
 * ★ 新增：生成智能行程规划
 */
async function generateSmartItinerary(userId) {
  try {
    const [sceneryRecs] = await Promise.all([
      getUserBasedRecommendations(userId, 'scenery', 5)
    ]);
    
    const [foodRecs] = await Promise.all([
      getUserBasedRecommendations(userId, 'food', 5)
    ]);

    // 交替排列景区和美食
    const itinerary = [];
    const maxLen = Math.max(sceneryRecs.length, foodRecs.length);
    
    for (let i = 0; i < maxLen; i++) {
      if (i < sceneryRecs.length) {
        itinerary.push({
          id: sceneryRecs[i].id,
          name: sceneryRecs[i].name,
          city: sceneryRecs[i].city,
          type: 'scenery',
          predictedRating: sceneryRecs[i].predictedRating
        });
      }
      if (i < foodRecs.length) {
        itinerary.push({
          id: foodRecs[i].id,
          name: foodRecs[i].name,
          city: foodRecs[i].city,
          type: 'food',
          predictedRating: foodRecs[i].predictedRating
        });
      }
    }

    return itinerary;
  } catch (e) {
    console.error('生成行程规划失败:', e);
    return [];
  }
}

module.exports = {
  getUserBasedRecommendations,
  generateSmartItinerary
};
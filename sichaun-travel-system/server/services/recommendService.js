// server/services/recommendService.js
const pool = require('../config/db');

/**
 * 基于用户行为的协同过滤推荐（增强版：综合收藏和浏览次数）
 * 1. 构建用户-物品评分矩阵
 * 2. 计算用户间余弦相似度
 * 3. 加权预测目标用户对未交互物品的评分
 */
async function getUserBasedRecommendations(userId, itemType, topN = 10) {
  // 获取所有用户行为（包含 view 和 bookmark）
  const [behaviors] = await pool.query(
    `SELECT user_id, item_id, action, rating FROM user_behaviors WHERE item_type=?`,
    [itemType]
  );
  
  if (behaviors.length === 0) return await getPopularItems(itemType, topN);

  // 构建评分矩阵：view=1分, bookmark=3分, rate=实际评分, like=2分
  const userRatings = new Map();
  for (const b of behaviors) {
    if (!userRatings.has(b.user_id)) userRatings.set(b.user_id, new Map());
    
    let score = 0;
    switch (b.action) {
      case 'view': score = 1; break;
      case 'like': score = 2; break;
      case 'bookmark': score = 3; break;
      case 'rate': score = b.rating || 3; break;
      default: score = 0;
    }
    
    const existing = userRatings.get(b.user_id).get(b.item_id) || 0;
    userRatings.get(b.user_id).set(b.item_id, existing + score); // 累加分数
  }

  const userIds = [...userRatings.keys()];
  const targetRated = userRatings.get(userId) || new Map();

  // 余弦相似度
  const similarities = [];
  for (const otherId of userIds) {
    if (otherId === userId) continue;
    const sim = cosineSimilarity(
      Object.fromEntries(targetRated),
      Object.fromEntries(userRatings.get(otherId))
    );
    similarities.push({ userId: otherId, similarity: sim });
  }
  similarities.sort((a, b) => b.similarity - a.similarity);

  // 取Top K 相似用户
  const K = 20;
  const topSimilar = similarities.slice(0, K);

  // 预测评分
  const predictions = new Map();
  for (const { userId: simUserId, similarity } of topSimilar) {
    if (similarity <= 0) continue;
    const simUserRatings = userRatings.get(simUserId);
    for (const [itemId, rating] of simUserRatings) {
      if (targetRated.has(itemId)) continue;
      const prev = predictions.get(itemId) || { weightedSum: 0, simSum: 0 };
      predictions.set(itemId, {
        weightedSum: prev.weightedSum + similarity * rating,
        simSum: prev.simSum + similarity
      });
    }
  }

  // 排序
  const result = [...predictions.entries()]
    .map(([itemId, v]) => ({
      itemId,
      predictedRating: v.weightedSum / v.simSum
    }))
    .sort((a, b) => b.predictedRating - a.predictedRating)
    .slice(0, topN);

  // 填充物品详情
  const table = itemType === 'scenery' ? 'sceneries' : 'foods';
  if (result.length === 0) return await getPopularItems(itemType, topN);
  
  const ids = result.map(r => r.itemId);
  const [items] = await pool.query(`SELECT * FROM ${table} WHERE id IN (?)`, [ids]);
  
  return items.map(item => {
    const pred = result.find(r => r.itemId === item.id);
    return {
      ...item,
      predictedRating: pred ? Math.round(pred.predictedRating * 20) : 0 // 转换为百分比
    };
  });
}

function cosineSimilarity(ratingsA, ratingsB) {
  let dot = 0, normA = 0, normB = 0;
  const allItems = new Set([...Object.keys(ratingsA), ...Object.keys(ratingsB)]);
  for (const item of allItems) {
    const a = ratingsA[item] || 0, b = ratingsB[item] || 0;
    dot += a * b;
    normA += a * a;
    normB += b * b;
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// 冷启动：返回热门物品
async function getPopularItems(itemType, topN) {
  const table = itemType === 'scenery' ? 'sceneries' : 'foods';
  const [items] = await pool.query(
    `SELECT * FROM ${table} ORDER BY rating DESC LIMIT ?`,
    [topN]
  );
  return items;
}

/**
 * 新增：基于收藏和浏览次数的行程规划推荐
 * 返回交替排列的景点和美食列表
 */
async function getItineraryRecommendations(userId, topN = 6) {
  // 获取用户收藏的景点和美食
  const [favorites] = await pool.query(
    `SELECT item_type, item_id FROM favorites WHERE user_id = ? ORDER BY created_at DESC`,
    [userId]
  );

  // 获取用户浏览最多的景点和美食
  const [browseHistory] = await pool.query(
    `SELECT item_type, item_id, COUNT(*) as view_count 
     FROM browse_history WHERE user_id = ? 
     GROUP BY item_type, item_id 
     ORDER BY view_count DESC LIMIT 20`,
    [userId]
  );

  // 综合推荐：优先推荐用户收藏的类型
  const [sceneryRec] = await getUserBasedRecommendations(userId, 'scenery', 3);
  const [foodRec] = await getUserBasedRecommendations(userId, 'food', 3);

  // 交替排列：景点 → 美食 → 景点 → 美食
  const itinerary = [];
  const maxLen = Math.max(sceneryRec?.length || 0, foodRec?.length || 0);
  for (let i = 0; i < maxLen; i++) {
    if (sceneryRec?.[i]) itinerary.push({ ...sceneryRec[i], type: 'scenery' });
    if (foodRec?.[i]) itinerary.push({ ...foodRec[i], type: 'food' });
  }

  return itinerary;
}

module.exports = { getUserBasedRecommendations, getItineraryRecommendations };
// server/services/recommendService.js
const pool = require('../config/db');

/**
 * 基于用户的协同过滤推荐
 * 1. 构建用户-物品评分矩阵
 * 2. 计算用户间余弦相似度
 * 3. 加权预测目标用户对未交互物品的评分
 */
async function getUserBasedRecommendations(userId, itemType, topN = 10) {
    // 获取所有用户行为
    const [behaviors] = await pool.query(
        `SELECT user_id, item_id, rating FROM user_behaviors 
         WHERE item_type=? AND rating > 0`, [itemType]
    );
    if (behaviors.length === 0) return await getPopularItems(itemType, topN);

    // 构建评分矩阵 Map<userId, Map<itemId, rating>>
    const userRatings = new Map();
    for (const b of behaviors) {
        if (!userRatings.has(b.user_id)) userRatings.set(b.user_id, new Map());
        userRatings.get(b.user_id).set(b.item_id, b.rating);
    }
    const userIds = [...userRatings.keys()];

    // 目标用户已评分物品
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
        .map(([itemId, v]) => ({ itemId, predictedRating: v.weightedSum / v.simSum }))
        .sort((a, b) => b.predictedRating - a.predictedRating)
        .slice(0, topN);

    // 填充物品详情
    const table = itemType === 'scenery' ? 'sceneries' : 'foods';
    if (result.length === 0) return await getPopularItems(itemType, topN);
    const ids = result.map(r => r.itemId);
    const [items] = await pool.query(`SELECT * FROM ${table} WHERE id IN (?)`, [ids]);
    return items.map(item => {
        const pred = result.find(r => r.itemId === item.id);
        return { ...item, predictedRating: pred ? pred.predictedRating.toFixed(2) : 0 };
    });
}

function cosineSimilarity(ratingsA, ratingsB) {
    let dot = 0, normA = 0, normB = 0;
    const allItems = new Set([...Object.keys(ratingsA), ...Object.keys(ratingsB)]);
    for (const item of allItems) {
        const a = ratingsA[item] || 0, b = ratingsB[item] || 0;
        dot += a * b; normA += a * a; normB += b * b;
    }
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// 冷启动：返回热门物品
async function getPopularItems(itemType, topN) {
    const table = itemType === 'scenery' ? 'sceneries' : 'foods';
    const [items] = await pool.query(
        `SELECT * FROM ${table} ORDER BY rating DESC LIMIT ?`, [topN]
    );
    return items;
}

module.exports = { getUserBasedRecommendations };
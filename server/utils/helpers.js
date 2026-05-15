// server/utils/helpers.js
/**
 * 分页查询辅助函数
 */
async function paginatedQuery(pool, baseSQL, params, page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize;
    const countSQL = `SELECT COUNT(*) as total FROM (${baseSQL}) as t`;
    const [countResult] = await pool.query(countSQL, params);
    const total = countResult[0].total;

    const dataSQL = `${baseSQL} LIMIT ${pageSize} OFFSET ${offset}`;
    const [rows] = await pool.query(dataSQL, params);

    return {
        data: rows,
        pagination: {
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize)
        }
    };
}

/**
 * 字符串安全截取
 */
function truncate(str, len = 100) {
    if (!str) return '';
    return str.length > len ? str.substring(0, len) + '...' : str;
}

/**
 * 生成随机评分数（用于模拟用户行为数据）
 */
function randomRating() {
    return Math.floor(Math.random() * 5) + 1;
}

module.exports = { paginatedQuery, truncate, randomRating };
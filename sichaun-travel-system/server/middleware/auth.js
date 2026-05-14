// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'sichuan_travel_jwt_secret_2026';

// 用户认证
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ code: 401, msg: '未提供认证令牌' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ code: 401, msg: '令牌无效或已过期' });
    }
};

// 管理员认证
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ code: 403, msg: '权限不足，需要管理员身份' });
    }
    next();
};

module.exports = { authenticate, requireAdmin };
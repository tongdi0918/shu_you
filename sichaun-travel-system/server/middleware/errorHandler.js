// server/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
    console.error('[Error]', err.stack);

    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ code: 400, msg: '数据重复，请检查后重试' });
    }

    if (err.name === 'ValidationError') {
        return res.status(400).json({ code: 400, msg: err.message });
    }

    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ code: 401, msg: '认证失败' });
    }

    res.status(500).json({
        code: 500,
        msg: process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message
    });
};

module.exports = errorHandler;
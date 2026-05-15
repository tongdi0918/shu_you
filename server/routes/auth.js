// server/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const router = express.Router();
const JWT_SECRET = 'sichuan_travel_jwt_secret_2026';

// 注册
router.post('/register', async (req, res) => {
    try {
        const { username, password, phone } = req.body;
        const [existing] = await pool.query('SELECT id FROM users WHERE username=?', [username]);
        if (existing.length) return res.status(400).json({ code:400, msg:'用户名已存在' });
        const hash = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            'INSERT INTO users (username, password, phone) VALUES (?,?,?)',
            [username, hash, phone]
        );
        res.json({ code:200, msg:'注册成功', data:{ userId: result.insertId } });
    } catch(e) { res.status(500).json({ code:500, msg:e.message }); }
});

// 登录
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const [users] = await pool.query('SELECT * FROM users WHERE username=?', [username]);
        if (!users.length) return res.status(401).json({ code:401, msg:'用户不存在' });
        const user = users[0];
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ code:401, msg:'密码错误' });
        const token = jwt.sign({ id:user.id, username:user.username, role:user.role }, JWT_SECRET, { expiresIn:'7d' });
        res.json({ code:200, msg:'登录成功', data:{ token, user:{ id:user.id, username:user.username, role:user.role } } });
    } catch(e) { res.status(500).json({ code:500, msg:e.message }); }
});

module.exports = router;
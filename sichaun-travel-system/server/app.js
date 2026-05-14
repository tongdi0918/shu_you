// server/app.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const app = express();

// ✅ CORS 配置改为更宽松的规则（允许公网访问）
app.use(cors({
  origin: '*',                      // 允许任何来源访问
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// 路由注册
app.use('/api/auth', require('./routes/auth'));
app.use('/api/scenic', require('./routes/scenic'));
app.use('/api/food', require('./routes/food'));
app.use('/api/recommend', require('./routes/recommend'));
app.use('/api/route', require('./routes/route'));
app.use('/api/admin', require('./routes/admin'));

// 静态文件（生产环境）
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.use(errorHandler);
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {    // ✅ 改为监听 0.0.0.0，接受来自任何 IP 的请求
  console.log(`Server running on port ${PORT}`);
});
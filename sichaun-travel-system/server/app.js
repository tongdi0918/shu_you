// server/app.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(cors());
app.use(express.json());

// 路由注册
app.use('/api/auth',    require('./routes/auth'));
app.use('/api/scenic',  require('./routes/scenic'));
app.use('/api/food',    require('./routes/food'));
app.use('/api/recommend', require('./routes/recommend'));
app.use('/api/route',   require('./routes/route'));
app.use('/api/admin',   require('./routes/admin'));

// 静态文件（生产环境）
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.use(errorHandler);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
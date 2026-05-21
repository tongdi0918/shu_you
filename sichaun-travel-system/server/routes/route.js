// sichaun-travel-system/server/routes/route.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// 路线规划接口
router.post('/plan', async (req, res) => {
  try {
    const { origin, destination, transportMode } = req.body;
    if (!origin || !destination || !transportMode) {
      return res.status(400).json({ code: 400, msg: '参数不完整' });
    }

    if (transportMode === 'highway') {
      // 模拟高速路线
      const distance = (Math.random() * 300 + 100).toFixed(1);
      const hours = Math.floor(distance / 80);
      const mins = Math.floor((distance % 80) / 80 * 60);
      const toll = (distance * 0.5).toFixed(0);

      return res.json({
        code: 200,
        data: {
          type: 'highway',
          distance: `${distance} 公里`,
          duration: `${hours}小时${mins}分钟`,
          toll: `¥${toll}`,
          steps: [
            { instruction: `从 ${origin} 出发，驶入最近的高速入口` },
            { instruction: `沿高速行驶约 ${(distance * 0.7).toFixed(0)} 公里` },
            { instruction: `在服务区可适当休息` },
            { instruction: `从 ${destination} 出口驶出高速` },
            { instruction: `抵达目的地：${destination}` }
          ]
        }
      });
    } else {
      // 模拟高铁路线
      const distance = (Math.random() * 400 + 100).toFixed(1);
      const speed = Math.random() > 0.5 ? 300 : 200;
      const hours = Math.floor(distance / speed);
      const mins = Math.floor((distance % speed) / speed * 60);
      const isHighSpeed = speed >= 300;

      return res.json({
        code: 200,
        data: {
          type: 'train',
          distance: `${distance} 公里`,
          duration: `${hours}小时${mins}分钟`,
          ticketPrice: isHighSpeed
            ? `¥${(distance * 0.45).toFixed(0)} 起（高铁二等座）`
            : `¥${(distance * 0.3).toFixed(0)} 起（动车二等座）`,
          steps: [
            { instruction: `前往 ${origin} 火车站` },
            { instruction: `乘坐${isHighSpeed ? 'G字头高铁' : 'D字头动车'}，约${hours}小时${mins}分钟` },
            { instruction: `请留意列车广播` },
            { instruction: `抵达 ${destination} 火车站` },
            { instruction: `出站后可换乘公共交通到达最终目的地` }
          ]
        }
      });
    }
  } catch (e) {
    res.status(500).json({ code: 500, msg: e.message });
  }
});

// 可选：返回热门目的地列表
router.get('/hot-destinations', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT name, city FROM sceneries ORDER BY rating DESC LIMIT 5');
    res.json({ code: 200, data: rows });
  } catch (e) {
    res.status(500).json({ code: 500, msg: e.message });
  }
});

module.exports = router;
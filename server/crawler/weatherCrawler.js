// server/crawler/weatherCrawler.js
const axios = require('axios');
const pool = require('../config/db');

/**
 * 从气象网站获取四川各景区天气数据，生成拥堵/天气预警
 * 实际项目中可对接和风天气、中国气象局等 API
 */
async function fetchWeatherAndWarn() {
    try {
        // 和风天气 API 示例（需替换为真实 API Key）
        const [sceneries] = await pool.query('SELECT id, name, longitude, latitude FROM sceneries');
        for (const s of sceneries) {
            const weatherRes = await axios.get(
                `https://devapi.qweather.com/v7/weather/now?location=${s.longitude},${s.latitude}&key=YOUR_QWEATHER_KEY`
            );
            const now = weatherRes.data.now;
            const warningText = generateWarning(now);
            await pool.query(
                `INSERT INTO warnings (scenic_id, weather_type, temperature, congestion_level, warning_text) 
                 VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE weather_type=?, temperature=?, warning_text=?`,
                [s.id, now.text, now.temp, now.temp>35?'high':'low', warningText, now.text, now.temp, warningText]
            );
        }
        console.log('[Weather] 天气预警数据更新完成');
    } catch (e) { console.error('[Weather] 获取失败:', e.message); }
}

function generateWarning(weatherNow) {
    const { text, temp } = weatherNow;
    if (temp > 35) return `当前气温${temp}°C，天气${text}，请注意防暑降温，景区可能客流高峰`;
    if (text.includes('雨') || text.includes('雪')) return `当前${text}，气温${temp}°C，路面湿滑请谨慎出行`;
    if (temp < 5) return `当前气温${temp}°C，天气${text}，请注意保暖`;
    return `当前天气${text}，气温${temp}°C，适合出行`;
}

module.exports = { fetchWeatherAndWarn };
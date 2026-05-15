// server/crawler/ticketCrawler.js
const axios = require('axios');
const cheerio = require('cheerio');
const pool = require('../config/db');

/**
 * 爬取四川景区门票数据（以四川省文旅厅官方名录为数据源）
 * 四川拥有18个5A级景区，包括九寨沟、峨眉山、青城山-都江堰等
 * 本函数为示例框架，实际需遵守 robots.txt 与法律法规
 */
async function crawlTicketPrices() {
    try {
        const { data } = await axios.get('https://wlt.sc.gov.cn/', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(data);
        // 实际解析逻辑（示例占位）
        const prices = [
            { name: '九寨沟', price: 169, season: '旺季' },
            { name: '峨眉山', price: 160, season: '旺季' },
            { name: '青城山-都江堰', price: 80, season: '全年' },
            { name: '乐山大佛', price: 80, season: '全年' },
            { name: '黄龙', price: 170, season: '旺季' },
            { name: '四姑娘山', price: 80, season: '旺季' },
            { name: '光雾山', price: 80, season: '秋季' },
            { name: '稻城亚丁', price: 146, season: '旺季' },
        ];
        for (const p of prices) {
            await pool.query(
                'UPDATE sceneries SET ticket_price=? WHERE name LIKE ?',
                [p.price, `%${p.name}%`]
            );
        }
        console.log('[Crawler] 门票数据更新完成');
    } catch (e) { console.error('[Crawler] 爬取失败:', e.message); }
}

module.exports = { crawlTicketPrices };
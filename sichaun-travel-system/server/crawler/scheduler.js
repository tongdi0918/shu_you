// server/crawler/scheduler.js
const cron = require('node-cron');
const { crawlTicketPrices } = require('./ticketCrawler');
const { fetchWeatherAndWarn } = require('./weatherCrawler');

// 每天凌晨2点爬取门票，每3小时更新天气
cron.schedule('0 2 * * *', crawlTicketPrices);
cron.schedule('0 */3 * * *', fetchWeatherAndWarn);

module.exports = { start: () => {
    crawlTicketPrices();
    fetchWeatherAndWarn();
}};
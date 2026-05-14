// server/config/db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'mysql8',
    database: 'sichuan_travel',
    waitForConnections: true,
    connectionLimit: 10,
});

module.exports = pool;
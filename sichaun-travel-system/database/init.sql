-- database/init.sql
CREATE DATABASE IF NOT EXISTS sichuan_travel DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sichuan_travel;

-- 用户表
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user','admin') DEFAULT 'user',
    phone VARCHAR(20),
    avatar VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 景区表
CREATE TABLE sceneries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    level VARCHAR(10) DEFAULT '5A',
    description TEXT,                    -- 故事化描述
    image_url VARCHAR(255),
    longitude DECIMAL(10,7),
    latitude  DECIMAL(10,7),
    ticket_price DECIMAL(10,2),
    opening_hours VARCHAR(100),
    season_best VARCHAR(50),             -- 最佳游玩季节
    tags VARCHAR(255),                   -- 逗号分隔：自然风光,历史文化,...
    rating FLOAT DEFAULT 4.5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 美食表
CREATE TABLE foods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    category VARCHAR(50),               -- 火锅,小吃,面食,...
    description TEXT,                    -- 故事化描述
    image_url VARCHAR(255),
    longitude DECIMAL(10,7),
    latitude  DECIMAL(10,7),
    avg_price DECIMAL(10,2),
    tags VARCHAR(255),
    rating FLOAT DEFAULT 4.5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户行为表（协同过滤训练数据）
CREATE TABLE user_behaviors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_type ENUM('scenery','food') NOT NULL,
    item_id INT NOT NULL,
    rating TINYINT DEFAULT 0,           -- 评分 1-5，0 表示仅浏览
    action ENUM('view','like','bookmark','rate'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_item (item_type, item_id)
);

-- 线路规划记录
CREATE TABLE route_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    origin VARCHAR(100),
    destination VARCHAR(100),
    waypoints TEXT,                      -- JSON: 途经景点坐标列表
    budget DECIMAL(10,2),
    duration INT,                        -- 计划天数
    route_json TEXT,                     -- 高德 API 返回的路线 JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 预警数据
CREATE TABLE warnings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    scenic_id INT,
    weather_type VARCHAR(50),            -- 晴天/阴天/降雨/...
    temperature FLOAT,
    congestion_level ENUM('low','medium','high'),
    warning_text VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
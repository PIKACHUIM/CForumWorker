-- 数据库迁移：为 users 表添加扩展个人资料字段

-- 年龄
ALTER TABLE users ADD COLUMN age INTEGER;

-- 性别：'male'（男）/ 'female'（女）/ 'other'（其他）
ALTER TABLE users ADD COLUMN gender TEXT;

-- 生日（格式：YYYY-MM-DD）
ALTER TABLE users ADD COLUMN birthday TEXT;

-- 属性：NULL（不填）/ 's' / 'm'
ALTER TABLE users ADD COLUMN attribute TEXT;

-- 是否南梁：0（否）/ 1（是）
ALTER TABLE users ADD COLUMN is_nanliang INTEGER DEFAULT 0;

-- 个人介绍
ALTER TABLE users ADD COLUMN bio TEXT;

-- 个人主页背景图 URL
ALTER TABLE users ADD COLUMN bg_image TEXT;

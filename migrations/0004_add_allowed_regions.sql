-- 数据库迁移：添加 site_allowed_regions 白名单设置
INSERT OR IGNORE INTO settings (key, value) VALUES ('site_allowed_regions', '');

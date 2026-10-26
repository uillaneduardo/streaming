-- Preserve existing catalogue categories without recreating demo content.
CREATE TABLE IF NOT EXISTS categories (
 id VARCHAR(36) PRIMARY KEY,
 name VARCHAR(100) NOT NULL,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE KEY uq_category_name(name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
INSERT IGNORE INTO categories(id,name)
 SELECT UUID(),TRIM(category) FROM series WHERE TRIM(category)<>'' GROUP BY TRIM(category);

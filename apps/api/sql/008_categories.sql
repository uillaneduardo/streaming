-- M2/M3: managed categories; never re-seed demonstration categories.
CREATE TABLE IF NOT EXISTS categories (
 id VARCHAR(36) PRIMARY KEY,
 name VARCHAR(100) NOT NULL,
 slug VARCHAR(120) NOT NULL UNIQUE,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 UNIQUE KEY uq_categories_name(name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Preserve categories currently used by real series as administrator-manageable rows.
-- This one-time backfill is not a fixture. It only mirrors existing catalog data.
INSERT IGNORE INTO categories(id,name,slug)
 SELECT UUID(),category,CONCAT('legacy-',SUBSTRING(SHA2(category,256),1,24))
 FROM series WHERE TRIM(category)<>'' GROUP BY category;

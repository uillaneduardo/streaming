-- Library of uploaded images, per-team visibility, and global upload controls.
CREATE TABLE IF NOT EXISTS media_upload_settings (
 id TINYINT UNSIGNED PRIMARY KEY,
 max_file_mb INT NOT NULL DEFAULT 8,
 max_files INT NOT NULL DEFAULT 500,
 allowed_types VARCHAR(120) NOT NULL DEFAULT 'png,jpeg,webp,gif'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT IGNORE INTO media_upload_settings(id,max_file_mb,max_files,allowed_types) VALUES(1,8,500,'png,jpeg,webp,gif');
CREATE TABLE IF NOT EXISTS media_assets (
 id CHAR(36) PRIMARY KEY,
 name VARCHAR(180) NOT NULL,
 original_name VARCHAR(255) NOT NULL,
 kind ENUM('poster','banner','thumbnail','icon','logo','other') NOT NULL DEFAULT 'other',
 tags_json TEXT NOT NULL,
 mime_type VARCHAR(40) NOT NULL,
 byte_size BIGINT UNSIGNED NOT NULL,
 sha256 CHAR(64) NOT NULL,
 storage_name VARCHAR(100) NOT NULL UNIQUE,
 team_id VARCHAR(36) NULL,
 creator_id CHAR(36) NULL,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
 INDEX ix_media_kind(kind),
 INDEX ix_media_team(team_id),
 FOREIGN KEY(team_id) REFERENCES teams(id) ON DELETE RESTRICT,
 FOREIGN KEY(creator_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

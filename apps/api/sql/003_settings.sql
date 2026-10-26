-- Configuration persisted in the same MariaDB volume; reruns preserve admin edits.
CREATE TABLE IF NOT EXISTS settings (
 id TINYINT UNSIGNED PRIMARY KEY,
 site_name VARCHAR(100) NOT NULL,
 site_description TEXT NOT NULL,
 autoplay BOOLEAN NOT NULL DEFAULT FALSE,
 contact_email VARCHAR(254) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT IGNORE INTO settings(id,site_name,site_description,autoplay,contact_email) VALUES(1,'CenaLivre','Histórias independentes, para todos.',FALSE,'');

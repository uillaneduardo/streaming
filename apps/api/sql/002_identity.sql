-- M1.1: contas, sessões revogáveis, equipes, grants e auditoria
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(254) NOT NULL UNIQUE,
  name VARCHAR(160) NOT NULL,
  password_hash VARCHAR(180) NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS sessions (
  token_hash CHAR(64) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  expires_at DATETIME(3) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  revoked_at DATETIME(3) NULL,
  INDEX ix_sessions_user (user_id,expires_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS team_members (
  team_id VARCHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  role ENUM('manager','editor','publisher','viewer') NOT NULL DEFAULT 'viewer',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY(team_id,user_id),
  FOREIGN KEY(team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS series_grants (
  series_id VARCHAR(36) NOT NULL,
  team_id VARCHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  permission ENUM('edit','publish') NOT NULL,
  PRIMARY KEY(series_id,team_id,user_id,permission),
  FOREIGN KEY(series_id,team_id) REFERENCES series_teams(series_id,team_id) ON DELETE CASCADE,
  FOREIGN KEY(team_id,user_id) REFERENCES team_members(team_id,user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS audit_log (
  id CHAR(36) PRIMARY KEY,
  actor_id CHAR(36) NULL,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id VARCHAR(36) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY(actor_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX ix_audit_target (target_type,target_id,created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

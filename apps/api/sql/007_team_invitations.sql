-- M1.3: convite de equipe por token de uso único (sem segredo em texto claro no banco).
CREATE TABLE IF NOT EXISTS team_invitations (
  id CHAR(36) PRIMARY KEY,
  team_id VARCHAR(36) NOT NULL,
  email VARCHAR(254) NOT NULL,
  role ENUM('manager','editor','publisher','viewer') NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  created_by CHAR(36) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  expires_at DATETIME(3) NOT NULL,
  accepted_at DATETIME(3) NULL,
  revoked_at DATETIME(3) NULL,
  accepted_by CHAR(36) NULL,
  INDEX ix_team_invitations_team (team_id,expires_at),
  INDEX ix_team_invitations_email (email,expires_at),
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (accepted_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Existing seasons remain published, preserving their current public visibility.
-- New seasons are created as drafts by the Studio API unless explicitly published by an authorized user.
ALTER TABLE seasons ADD COLUMN IF NOT EXISTS status ENUM('draft','published','suspended') NOT NULL DEFAULT 'published';
CREATE INDEX IF NOT EXISTS idx_seasons_status ON seasons(status);

-- =========================================
-- STREAK SYSTEM MIGRATION (v1)
-- =========================================

-- 1. Update INTERNS table
ALTER TABLE interns 
ADD COLUMN IF NOT EXISTS streak INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak_start DATE,
ADD COLUMN IF NOT EXISTS longest_streak_end DATE,
ADD COLUMN IF NOT EXISTS current_streak_start DATE,
ADD COLUMN IF NOT EXISTS streak_freeze INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_points INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_attendance DATE;

-- 2. Create BADGES table
CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    icon VARCHAR(100) NOT NULL, -- Lucide icon name
    description TEXT,
    milestone_days INT, -- Optional: used for auto-awarding
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create INTERN_BADGES junction table
CREATE TABLE IF NOT EXISTS intern_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    intern_id UUID NOT NULL REFERENCES interns(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_intern_badge UNIQUE (intern_id, badge_id)
);

-- 4. Idempotent Seed: Default Badges
INSERT INTO badges (name, icon, description, milestone_days)
VALUES 
    ('3-Day Starter', 'flame', 'Mark attendance for 3 consecutive days.', 3),
    ('1-Week Warrior', 'shield-check', 'Completed a full week of attendance streak.', 7),
    ('10-Day Legend', 'trophy', 'Reached a massive 10-day attendance streak!', 10),
    ('Monthly Master', 'zap', 'Maintained a consistent 30-day attendance streak.', 30)
ON CONFLICT (name) DO UPDATE 
SET 
    icon = EXCLUDED.icon,
    description = EXCLUDED.description,
    milestone_days = EXCLUDED.milestone_days;

-- 5. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_intern_badges_intern ON intern_badges(intern_id);
CREATE INDEX IF NOT EXISTS idx_badges_milestone ON badges(milestone_days);

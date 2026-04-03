-- =========================================
-- GAMIFICATION SYSTEM MIGRATION (v1)
-- =========================================

-- 1. Create TASKS table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    intern_id UUID NOT NULL REFERENCES interns(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    category VARCHAR(50) DEFAULT 'Development',
    difficulty VARCHAR(20) DEFAULT 'Medium',
    points_reward INT DEFAULT 20,
    deadline TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_intern_task UNIQUE (intern_id, title, category)
);

-- 2. Update INTERNS table for Task-Specific logic
ALTER TABLE interns 
ADD COLUMN IF NOT EXISTS task_streak INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_task_streak INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_task_date DATE,
ADD COLUMN IF NOT EXISTS total_points INT DEFAULT 0; -- Added if not already present

-- 3. Create POINTS_HISTORY table for immutable audit
CREATE TABLE IF NOT EXISTS points_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    intern_id UUID NOT NULL REFERENCES interns(id) ON DELETE CASCADE,
    points INT NOT NULL,
    reason TEXT NOT NULL,
    reference_id UUID, -- Task ID or Attendance ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_points_entry UNIQUE (intern_id, reference_id, reason)
);

-- 4. Seed Task Badges
INSERT INTO badges (name, icon, description, milestone_days)
VALUES 
    ('Task Starter', 'check-circle', 'Completed your first task!', 1),
    ('5-Day Streak', 'award', 'Completed tasks for 5 consecutive days.', 5),
    ('10-Day Streak Bonus', 'flame', 'Maintained a massive 10-day task streak!', 10),
    ('Fast Learner', 'zap', 'Completed a task 24 hours before the deadline.', NULL)
ON CONFLICT (name) DO UPDATE 
SET 
    icon = EXCLUDED.icon,
    description = EXCLUDED.description,
    milestone_days = EXCLUDED.milestone_days;

-- 5. Performance Indexes
-- Using DESC index for leaderboard performance
DROP INDEX IF EXISTS idx_interns_points_desc;
CREATE INDEX idx_interns_points_desc ON interns (total_points DESC);

CREATE INDEX IF NOT EXISTS idx_tasks_intern ON tasks(intern_id);
-- 6. Badge Duplication Safety
-- This ensures an intern cannot be awarded the same badge twice.
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_intern_badge_task') THEN
        ALTER TABLE intern_badges ADD CONSTRAINT unique_intern_badge_task UNIQUE (intern_id, badge_id);
    END IF;
END $$;

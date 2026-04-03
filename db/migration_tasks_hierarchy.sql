-- =========================================
-- HIERARCHICAL TASK SYSTEM MIGRATION
-- =========================================

BEGIN;

-- 1. Create Department Tasks Table (Tier 1)
-- This table stores tasks created by Super Admins for specific departments
CREATE TABLE IF NOT EXISTS department_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    department_id UUID NOT NULL,
    
    title TEXT NOT NULL,
    description TEXT,
    
    status VARCHAR(20) DEFAULT 'PENDING' 
        CHECK (status IN ('PENDING', 'ASSIGNED', 'COMPLETED')),
    
    created_by UUID NOT NULL,
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_dept_task_org
        FOREIGN KEY (organization_id)
        REFERENCES organizations(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_dept_task_dept
        FOREIGN KEY (department_id)
        REFERENCES departments(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_dept_task_creator
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE SET NULL
);

-- 2. Modify Existing Tasks Table (Tier 2)
-- Link individual intern tasks to their master departmental task
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='tasks' AND column_name='parent_dept_task_id'
    ) THEN
        ALTER TABLE tasks ADD COLUMN parent_dept_task_id UUID;
        
        ALTER TABLE tasks 
            ADD CONSTRAINT fk_task_parent_dept
            FOREIGN KEY (parent_dept_task_id)
            REFERENCES department_tasks(id)
            ON DELETE SET NULL;
    END IF;
END $$;

-- 3. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_dept_tasks_org ON department_tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_dept_tasks_dept ON department_tasks(department_id);
CREATE INDEX IF NOT EXISTS idx_tasks_parent_dept ON tasks(parent_dept_task_id);

COMMIT;

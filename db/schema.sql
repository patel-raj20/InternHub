-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================
-- 1. ORGANIZATIONS
-- =========================
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    industry VARCHAR(100),
    website VARCHAR(255),
    logo_url TEXT,
    super_admin_id UUID UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- 2. DEPARTMENTS
-- =========================
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_department_org
        FOREIGN KEY (organization_id)
        REFERENCES organizations(id)
        ON DELETE CASCADE
);

-- =========================
-- 3. USERS
-- =========================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    department_id UUID,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('SUPER_ADMIN', 'DEPT_ADMIN', 'INTERN')),
    status VARCHAR(20) DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE', 'INACTIVE')),
    invite_status VARCHAR(20) DEFAULT 'PENDING'
        CHECK (invite_status IN ('PENDING', 'ACCEPTED', 'EXPIRED')),
    invite_token TEXT UNIQUE,
    invite_expires_at TIMESTAMP,
    last_login_at TIMESTAMP,
    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_org
        FOREIGN KEY (organization_id)
        REFERENCES organizations(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_user_department
        FOREIGN KEY (department_id)
        REFERENCES departments(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_user_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE SET NULL
);

-- =========================
-- 4. INTERNS
-- =========================
CREATE TABLE interns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL,
    organization_id UUID NOT NULL,
    college_name VARCHAR(255),
    degree VARCHAR(100),
    specialization VARCHAR(100),
    graduation_year INT,
    cgpa DECIMAL(3,2),
    skills JSONB,
    certifications JSONB,
    github_url TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    bio TEXT,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    joining_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_intern_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_intern_org
        FOREIGN KEY (organization_id)
        REFERENCES organizations(id)
        ON DELETE CASCADE
);

-- =========================
-- RELATION: ORGANIZATION → SUPER ADMIN
-- =========================
ALTER TABLE organizations
ADD CONSTRAINT fk_org_super_admin
FOREIGN KEY (super_admin_id)
REFERENCES users(id)
ON DELETE SET NULL;

-- =========================
-- UNIQUE CONSTRAINTS
-- =========================
CREATE UNIQUE INDEX unique_super_admin_per_org
ON users(organization_id)
WHERE role = 'SUPER_ADMIN';

-- =========================
-- INDEXES
-- =========================
CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_users_department ON users(department_id);
CREATE INDEX idx_departments_org ON departments(organization_id);

-- =========================
-- AUTO UPDATE FUNCTION
-- =========================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
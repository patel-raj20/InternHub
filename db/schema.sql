-- =========================================
-- INTERNHUB DATABASE SCHEMA
-- =========================================

-- Enable UUID extension (PostgreSQL)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================
-- 1. ORGANIZATIONS
-- =========================================
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    name VARCHAR(255) NOT NULL,
    description TEXT,
    industry VARCHAR(100),
    website VARCHAR(255),
    logo_url TEXT,

    created_by UUID,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- 2. DEPARTMENTS
-- =========================================
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

-- =========================================
-- 3. USERS
-- =========================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID, -- Now nullable for DEVELOPER
    department_id UUID,

    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),

    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('DEVELOPER', 'SUPER_ADMIN', 'DEPT_ADMIN', 'INTERN')),
    status VARCHAR(20) DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE', 'INACTIVE')),
    invite_status VARCHAR(20) DEFAULT 'PENDING'
        CHECK (invite_status IN ('PENDING', 'ACCEPTED', 'EXPIRED')),
    invite_token TEXT UNIQUE,
    invite_expires_at TIMESTAMP,

    reset_otp VARCHAR(10),
    reset_otp_expires_at TIMESTAMP,

    last_login_at TIMESTAMP,

    created_by UUID,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_role_org_nullability 
        CHECK ( (role = 'DEVELOPER' AND organization_id IS NULL) OR (role != 'DEVELOPER' AND organization_id IS NOT NULL) ),

    CONSTRAINT fk_user_org
        FOREIGN KEY (organization_id)
        REFERENCES organizations(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_user_department
        FOREIGN KEY (department_id)
        REFERENCES departments(id)
        ON DELETE SET NULL
);

-- =========================================
-- 4. INTERNS
-- =========================================
CREATE TABLE interns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    user_id UUID UNIQUE NOT NULL,

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
        ON DELETE CASCADE
);

-- =========================================
-- INDEXES (PERFORMANCE)
-- =========================================
CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_users_department ON users(department_id);
CREATE INDEX idx_departments_org ON departments(organization_id);

-- =========================================
-- 5. ATTENDANCE SETTINGS
-- =========================================
CREATE TABLE attendance_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID UNIQUE NOT NULL,
    
    office_lat DOUBLE PRECISION NOT NULL,
    office_lng DOUBLE PRECISION NOT NULL,
    allowed_radius_meters INT DEFAULT 100,
    
    work_start_time TIME DEFAULT '09:00:00',
    late_threshold_minutes INT DEFAULT 15,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_settings_department
        FOREIGN KEY (department_id)
        REFERENCES departments(id)
        ON DELETE CASCADE
);

-- =========================================
-- 6. ATTENDANCE RECORDS
-- =========================================
CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    intern_id UUID NOT NULL,
    
    date DATE DEFAULT CURRENT_DATE,
    check_in_time TIMESTAMP NOT NULL,
    
    status VARCHAR(20) NOT NULL CHECK (
        status IN ('PRESENT', 'LATE', 'ABSENT')
    ),
    
    location_lat DOUBLE PRECISION,
    location_lng DOUBLE PRECISION,
    distance_meters DOUBLE PRECISION,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_attendance_intern
        FOREIGN KEY (intern_id)
        REFERENCES interns(id)
        ON DELETE CASCADE,
        
    CONSTRAINT unique_intern_daily_attendance
        UNIQUE (intern_id, date)
);

CREATE INDEX idx_attendance_intern ON attendance_records(intern_id);
CREATE INDEX idx_attendance_date ON attendance_records(date);
"""
train_agent.py
==============
Training script for the InternHub Vanna agent.
Expects that environment variables (GROQ, POSTGRES_* or DB_*, CHROMA_PATH) are set.
"""

import logging
from vanna_setup import vn, connect_to_postgres

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── DDL (Data Definition Language) ─────────────────────────────────────
DDL_STATEMENTS = [
    # organizations
    """
    CREATE TABLE organizations (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        industry VARCHAR(100),
        website VARCHAR(255),
        logo_url TEXT,
        super_admin_id UUID,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """,
    # departments
    """
    CREATE TABLE departments (
        id UUID PRIMARY KEY,
        organization_id UUID NOT NULL REFERENCES organizations(id),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """,
    # users
    """
    CREATE TABLE users (
        id UUID PRIMARY KEY,
        organization_id UUID NOT NULL REFERENCES organizations(id),
        department_id UUID REFERENCES departments(id),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100),
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        password_hash TEXT NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('SUPER_ADMIN', 'DEPT_ADMIN', 'INTERN')),
        status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
        invite_status VARCHAR(20) DEFAULT 'PENDING' CHECK (invite_status IN ('PENDING', 'ACCEPTED', 'EXPIRED')),
        invite_token TEXT UNIQUE,
        invite_expires_at TIMESTAMP,
        last_login_at TIMESTAMP,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """,
    # interns
    """
    CREATE TABLE interns (
        id UUID PRIMARY KEY,
        user_id UUID UNIQUE NOT NULL REFERENCES users(id),
        organization_id UUID NOT NULL REFERENCES organizations(id),
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """
]

# ── Documentation ──────────────────────────────────────────────────────
DOCUMENTATION = [
    """
    The schema is organization-centric:
    - organizations is the tenant root.
    - departments and users belong to organizations.
    - interns are profiles linked one-to-one with users where users.role = 'INTERN'.
    """,
    """
    Status conventions:
    - users.status uses uppercase: 'ACTIVE' / 'INACTIVE'.
    - users.role values are uppercase: 'SUPER_ADMIN', 'DEPT_ADMIN', 'INTERN'.
    - invite lifecycle is in users.invite_status: 'PENDING', 'ACCEPTED', 'EXPIRED'.
    """
]

# ── Golden Queries ───────────────────────────────────────────────────
GOLDEN_QUERIES = [
    {
        "question": "Show all organizations with number of departments and number of users.",
        "sql": """
            SELECT
                o.id,
                o.name,
                COUNT(DISTINCT d.id) AS department_count,
                COUNT(DISTINCT u.id) AS user_count
            FROM organizations o
            LEFT JOIN departments d ON d.organization_id = o.id
            LEFT JOIN users u ON u.organization_id = o.id
            GROUP BY o.id, o.name
            ORDER BY o.name;
        """
    },
    {
        "question": "List all departments with their organization names.",
        "sql": """
            SELECT
                d.id,
                d.name AS department_name,
                o.name AS organization_name,
                d.created_at
            FROM departments d
            JOIN organizations o ON o.id = d.organization_id
            ORDER BY o.name, d.name;
        """
    },
    {
        "question": "Show active users by role for each organization.",
        "sql": """
            SELECT
                o.name AS organization_name,
                u.role,
                COUNT(u.id) AS active_user_count
            FROM users u
            JOIN organizations o ON o.id = u.organization_id
            WHERE u.status = 'ACTIVE'
            GROUP BY o.name, u.role
            ORDER BY o.name, u.role;
        """
    },
    {
        "question": "List users with their department names and invite status.",
        "sql": """
            SELECT
                u.id,
                u.first_name,
                u.last_name,
                u.email,
                u.role,
                u.status,
                u.invite_status,
                d.name AS department_name
            FROM users u
            LEFT JOIN departments d ON d.id = u.department_id
            ORDER BY u.created_at DESC;
        """
    },
    {
        "question": "Show intern profiles with organization and contact details.",
        "sql": """
            SELECT
                i.id AS intern_profile_id,
                o.name AS organization_name,
                u.first_name,
                u.last_name,
                u.email,
                i.college_name,
                i.degree,
                i.specialization,
                i.joining_date,
                i.end_date
            FROM interns i
            JOIN users u ON u.id = i.user_id
            JOIN organizations o ON o.id = i.organization_id
            ORDER BY i.created_at DESC;
        """
    },
    {
        "question": "Count intern profiles by organization.",
        "sql": """
            SELECT
                o.name AS organization_name,
                COUNT(i.id) AS intern_profile_count
            FROM organizations o
            LEFT JOIN interns i ON i.organization_id = o.id
            GROUP BY o.id, o.name
            ORDER BY intern_profile_count DESC, organization_name;
        """
    }
]

def run_training():
    logger.info("Starting training of InternHub AI...")

    # Ensure the trainer is connected before embedding samples.
    connect_to_postgres()

    # 1. DDL
    for ddl in DDL_STATEMENTS:
        vn.train(ddl=ddl)
    
    # 2. Docs
    for doc in DOCUMENTATION:
        vn.train(documentation=doc)
    
    # 3. Golden Queries
    for query in GOLDEN_QUERIES:
        vn.train(question=query['question'], sql=query['sql'])

    logger.info("Training complete! ChromaDB seed successful.")

if __name__ == "__main__":
    run_training()

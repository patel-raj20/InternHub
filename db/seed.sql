-- Seed default organization
INSERT INTO organizations (id, name, description)
VALUES ('00000000-0000-0000-0000-000000000001', 'InternHub Org', 'Default organization for InternHub')
ON CONFLICT (id) DO NOTHING;

-- Seed super admin user
INSERT INTO users (id, organization_id, first_name, last_name, email, password_hash, role, status)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Admin',
    'User',
    'admin@internhub.com',
    '$2b$10$qlzaQ14tVahFRdKBoJNJ6.DE4S2lGyyOKcPpKjx/NQTgdN3gGeLYi', -- Password: admin123
    'SUPER_ADMIN',
    'ACTIVE'
)
ON CONFLICT (email) DO NOTHING;

-- Seed Dept Admin user
INSERT INTO users (id, organization_id, first_name, last_name, email, password_hash, role, status)
VALUES (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'Department',
    'Admin',
    'dept@internhub.com',
    '$2b$10$qlzaQ14tVahFRdKBoJNJ6.DE4S2lGyyOKcPpKjx/NQTgdN3gGeLYi', -- Password: admin123
    'DEPT_ADMIN',
    'ACTIVE'
)
ON CONFLICT (email) DO NOTHING;

-- Seed Intern user
INSERT INTO users (id, organization_id, first_name, last_name, email, password_hash, role, status)
VALUES (
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    'Intern',
    'User',
    'intern@internhub.com',
    '$2b$10$qlzaQ14tVahFRdKBoJNJ6.DE4S2lGyyOKcPpKjx/NQTgdN3gGeLYi', -- Password: admin123
    'INTERN',
    'ACTIVE'
)
ON CONFLICT (email) DO NOTHING;

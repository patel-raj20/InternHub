export type UserRole = "INTERN" | "DEPT_ADMIN" | "SUPER_ADMIN";

export interface User {
  user_id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
  password?: string;
}

export interface Department {
  id: string; // Matches 'id' in DB
  organization_id: string;
  name: string;
  description?: string;
  count?: number; // UI helper for intern count
  created_at: string;
}

export interface Intern {
  id: string; // Matches 'id' in DB
  user_id: string;
  department_id: string;
  status: "ACTIVE" | "COMPLETED" | "DROPPED";
  created_at: string;
  
  // Basic Info
  full_name: string;
  email?: string;
  password?: string;
  phone?: string;
  dob?: string;
  blood_group?: string;
  
  // Academic Info
  college_name?: string;
  degree?: string;
  specialization?: string;
  graduation_year?: number;
  cgpa?: number;
  enrollment_number: string;
  
  // Professional Links & Bio
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  bio?: string;
  
  // Skills & Certs (JSONB in DB)
  skills?: any; // or string[]
  certifications?: any; // or string[]
  
  // Location
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  
  // Dates
  joining_date: string;
  end_date?: string;
  
  // UI helper fields
  department_name?: string;
  backlogs?: number;
}

export interface Organization {
  id: string;
  name: string;
  description?: string;
  industry?: string;
  website?: string;
  logo_url?: string;
  created_by?: string;
  created_at: string;
}

export type UserRole = "INTERN" | "DEPT_ADMIN" | "SUPER_ADMIN";
export type UserStatus = "ACTIVE" | "INACTIVE" | "COMPLETED";
export type InviteStatus = "PENDING" | "ACCEPTED" | "EXPIRED";

export interface User {
  id: string;
  organization_id: string;
  department_id?: string;
  first_name: string;
  last_name?: string;
  email: string;
  phone?: string;
  password_hash?: string;
  role: UserRole;
  status: UserStatus;
  invite_status: InviteStatus;
  invite_token?: string;
  invite_expires_at?: string;
  last_login_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  organization?: Organization;
  department?: Department;
}

export interface Organization {
  id: string;
  name: string;
  description?: string;
  industry?: string;
  website?: string;
  logo_url?: string;
  super_admin_id?: string;
  created_at: string;
}

export interface Department {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  created_at: string;
  users?: User[];
  
  // Aggregates/Joins
  intern_count?: number;
  organization?: Organization;
  head?: {
    id: string;
    first_name: string;
    last_name?: string;
    email: string;
  };
}

export interface Intern {
  id: string;
  user_id: string;
  organization_id: string;
  college_name?: string;
  degree?: string;
  specialization?: string;
  graduation_year?: number;
  cgpa?: number;
  enrollment_number?: string;
  skills?: any; // JSONB
  certifications?: any; // JSONB
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  bio?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  dob?: string;
  joining_date: string;
  end_date?: string;
  created_at: string;

  // Joined from User
  user: User;
  
  // Flattened helpers for UI (optional but used in components)
  full_name?: string; 
  email?: string;
  status?: UserStatus;
}

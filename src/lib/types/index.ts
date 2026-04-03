export type UserRole = "DEVELOPER" | "SUPER_ADMIN" | "DEPT_ADMIN" | "INTERN";
export type UserStatus = "ACTIVE" | "INACTIVE" | "COMPLETED" | "PENDING";
export type InviteStatus = "PENDING" | "ACCEPTED" | "EXPIRED";

export interface User {
  id: string;
  organization_id?: string; // Optional for DEVELOPER
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
  blood_group?: string;
  joining_date: string;
  end_date?: string;
  created_at: string;

  // Streak & Rewards
  streak?: number;
  longest_streak?: number;
  longest_streak_start?: string;
  longest_streak_end?: string;
  current_streak_start?: string;
  streak_freeze?: number;
  total_points?: number;
  last_attendance?: string;
  intern_badges?: InternBadge[];

  // Joined fields
  user: User;
  organization?: Organization;

  // Flattened helpers for UI (optional but used in components)
  full_name?: string;
  email?: string;
  status?: UserStatus;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description?: string;
  milestone_days?: number;
}

export interface InternBadge {
  id: string;
  intern_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}

export interface AttendanceSettings {
  id: string;
  department_id: string;
  office_lat: number;
  office_lng: number;
  allowed_radius_meters: number;
  work_start_time: string;
  late_threshold_minutes: number;
  created_at?: string;
  updated_at?: string;
}

export interface AttendanceRecord {
  id: string;
  intern_id: string;
  date: string;
  check_in_time: string;
  status: 'PRESENT' | 'LATE' | 'ABSENT';
  location_lat?: number;
  location_lng?: number;
  distance_meters?: number;
  created_at?: string;
  intern?: Intern;
}

export interface Task {
  id: string;
  intern_id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  category: string;
  difficulty: string;
  points_reward: number;
  deadline: string;
  completed_at?: string;
  created_at: string;
  parent_dept_task_id?: string; // Link to department task
}

export interface DepartmentTask {
  id: string;
  organization_id: string;
  department_id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'ASSIGNED' | 'COMPLETED';
  created_by: string;
  deadline: string;
  created_at: string;
  updated_at: string;
  department?: {
    name: string;
  };
}

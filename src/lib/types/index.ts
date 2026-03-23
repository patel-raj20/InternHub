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
  depart_id: string;
  name: string;
  count?: number;
  created_at: string;
}

export interface Intern {
  intern_id: string;
  user_id: string;
  department_id: string;
  status: "ACTIVE" | "COMPLETED" | "DROPPED";
  created_at: string;
  
  // Display/Optional fields
  full_name: string;
  phone?: string;
  dob?: string;
  blood_group?: string;
  enrollment_number: string;
  joining_date: string;
  no_of_backlogs: number;
  
  // UI helper fields (often joined in SQL)
  department_name?: string;
  email?: string; // Often joined from users table
}

import { Intern } from "../types";

// Mock data for initial development
const MOCK_INTERNS: Intern[] = [
  {
    intern_id: "1",
    user_id: "u1",
    department_id: "dept1",
    department_name: "Computer Science",
    full_name: "John Doe",
    email: "john@example.com",
    enrollment_number: "EN12345",
    joining_date: "2024-01-15",
    status: "ACTIVE",
    no_of_backlogs: 0,
    created_at: new Date().toISOString(),
  },
  {
    intern_id: "2",
    user_id: "u2",
    department_id: "dept2",
    department_name: "Information Technology",
    full_name: "Jane Smith",
    email: "jane@example.com",
    enrollment_number: "EN67890",
    joining_date: "2024-02-20",
    status: "COMPLETED",
    no_of_backlogs: 1,
    created_at: new Date().toISOString(),
  },
];

export async function getInterns(departmentId?: string): Promise<Intern[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  if (departmentId) {
    return MOCK_INTERNS.filter(intern => intern.department_id === departmentId);
  }
  return MOCK_INTERNS;
}

export async function getInternById(id: string): Promise<Intern | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return MOCK_INTERNS.find((intern) => intern.intern_id === id);
}

export async function createIntern(intern: Omit<Intern, "intern_id" | "user_id" | "created_at">): Promise<Intern> {
  const newIntern: Intern = { 
    ...intern, 
    intern_id: Math.random().toString(36).substr(2, 9),
    user_id: Math.random().toString(36).substr(2, 9),
    created_at: new Date().toISOString()
  };
  MOCK_INTERNS.push(newIntern);
  return newIntern;
}

export async function updateIntern(id: string, data: Partial<Intern>): Promise<Intern> {
  const index = MOCK_INTERNS.findIndex((intern) => intern.intern_id === id);
  if (index === -1) throw new Error("Intern not found");
  MOCK_INTERNS[index] = { ...MOCK_INTERNS[index], ...data };
  return MOCK_INTERNS[index];
}

export async function deleteIntern(id: string): Promise<void> {
  const index = MOCK_INTERNS.findIndex((intern) => intern.intern_id === id);
  if (index !== -1) MOCK_INTERNS.splice(index, 1);
}

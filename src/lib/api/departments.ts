import { Department } from "../types";

const MOCK_DEPARTMENTS: Department[] = [
  { depart_id: "dept1", name: "Computer Science", count: 12, created_at: new Date().toISOString() },
  { depart_id: "dept2", name: "Information Technology", count: 8, created_at: new Date().toISOString() },
  { depart_id: "dept3", name: "Mechanical Engineering", count: 5, created_at: new Date().toISOString() },
];

export async function getDepartments(): Promise<Department[]> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return MOCK_DEPARTMENTS;
}

export async function getDepartmentById(id: string): Promise<Department | undefined> {
  return MOCK_DEPARTMENTS.find(d => d.depart_id === id);
}

export async function createDepartment(name: string): Promise<Department> {
  const newDept: Department = {
    depart_id: `dept${MOCK_DEPARTMENTS.length + 1}`,
    name,
    count: 0,
    created_at: new Date().toISOString()
  };
  MOCK_DEPARTMENTS.push(newDept);
  return newDept;
}

export async function deleteDepartment(id: string): Promise<void> {
  const index = MOCK_DEPARTMENTS.findIndex(d => d.depart_id === id);
  if (index !== -1) MOCK_DEPARTMENTS.splice(index, 1);
}

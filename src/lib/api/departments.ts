import { Department } from "../types";

const MOCK_DEPARTMENTS: Department[] = [
  { id: "dept1", organization_id: "org1", name: "Engineering", description: "Core software development team.", count: 12, created_at: new Date().toISOString() },
  { id: "dept2", organization_id: "org1", name: "Product", description: "Product management and design.", count: 8, created_at: new Date().toISOString() },
  { id: "dept3", organization_id: "org2", name: "Research", description: "AI research and development.", count: 5, created_at: new Date().toISOString() },
];

export async function getDepartments(): Promise<Department[]> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return MOCK_DEPARTMENTS;
}

export async function getDepartmentsByOrg(orgId: string): Promise<Department[]> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return MOCK_DEPARTMENTS.filter(d => d.organization_id === orgId);
}

export async function getDepartmentById(id: string): Promise<Department | undefined> {
  return MOCK_DEPARTMENTS.find(d => d.id === id);
}

export async function createDepartment(orgId: string, data: Omit<Department, "id" | "created_at" | "organization_id" | "count">): Promise<Department> {
  const newDept: Department = {
    ...data,
    id: `dept${MOCK_DEPARTMENTS.length + 1}`,
    organization_id: orgId,
    count: 0,
    created_at: new Date().toISOString()
  };
  MOCK_DEPARTMENTS.push(newDept);
  return newDept;
}

export async function deleteDepartment(id: string): Promise<void> {
  const index = MOCK_DEPARTMENTS.findIndex(d => d.id === id);
  if (index !== -1) MOCK_DEPARTMENTS.splice(index, 1);
}

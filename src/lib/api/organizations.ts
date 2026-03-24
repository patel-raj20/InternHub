import { Organization } from "../types";

const MOCK_ORGANIZATIONS: Organization[] = [
  {
    id: "org1",
    name: "TechCorp Industries",
    description: "Leading technology solutions provider specializing in cloud computing.",
    industry: "Technology",
    website: "https://techcorp.example.com",
    created_at: new Date().toISOString(),
  },
  {
    id: "org2",
    name: "Innovate AI",
    description: "Cutting-edge artificial intelligence research and development.",
    industry: "AI/ML",
    website: "https://innovate.ai",
    created_at: new Date().toISOString(),
  },
];

export async function getOrganizations(): Promise<Organization[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return MOCK_ORGANIZATIONS;
}

export async function getOrganizationById(id: string): Promise<Organization | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return MOCK_ORGANIZATIONS.find((org) => org.id === id);
}

export async function createOrganization(org: Omit<Organization, "id" | "created_at">): Promise<Organization> {
  const newOrg: Organization = { 
    ...org, 
    id: Math.random().toString(36).substr(2, 9),
    created_at: new Date().toISOString()
  };
  MOCK_ORGANIZATIONS.push(newOrg);
  return newOrg;
}

export async function updateOrganization(id: string, data: Partial<Organization>): Promise<Organization> {
  const index = MOCK_ORGANIZATIONS.findIndex((org) => org.id === id);
  if (index === -1) throw new Error("Organization not found");
  MOCK_ORGANIZATIONS[index] = { ...MOCK_ORGANIZATIONS[index], ...data };
  return MOCK_ORGANIZATIONS[index];
}

export async function deleteOrganization(id: string): Promise<void> {
  const index = MOCK_ORGANIZATIONS.findIndex((org) => org.id === id);
  if (index !== -1) MOCK_ORGANIZATIONS.splice(index, 1);
}

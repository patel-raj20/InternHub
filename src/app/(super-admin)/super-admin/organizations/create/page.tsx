"use client";

import { OrganizationForm } from "@/components/organizations/organization-form";
import { createOrganization } from "@/lib/api/organizations";
import { useRouter } from "next/navigation";

export default function CreateOrganizationPage() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    try {
      await createOrganization(data);
      router.push("/super-admin/organizations");
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Add New Organization</h1>
        <p className="text-muted-foreground mt-1">Register a new company to the InternHub platform.</p>
      </div>

      <OrganizationForm mode="create" onSubmit={handleSubmit} />
    </div>
  );
}

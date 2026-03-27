"use client";

import { OrganizationForm } from "@/components/organizations/organization-form";
import { graphqlService } from "@/lib/services/graphql-service";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function CreateOrganizationPage() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    try {
      await graphqlService.addOrganization({
        ...data,
        industry: data.industry || "",
        website: data.website || "",
      });
      toast.success("Organization created successfully");
      router.push("/super-admin/organizations");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create organization");
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

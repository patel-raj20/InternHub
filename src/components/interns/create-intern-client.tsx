"use client";

import { useEffect, useState } from "react";
import { InternForm } from "@/components/forms/intern-form";
import { graphqlService } from "@/lib/services/graphql-service";
import { Department } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import toast from "react-hot-toast";

export default function CreateInternPage({ 
  departments, 
  redirectPath = "/super-admin/interns",
  title = "Create New Intern"
}: { 
  departments: Department[],
  redirectPath?: string,
  title?: string
}) {
  const router = useRouter();
  const { organization_id, id: currentUserId } = useSelector((state: RootState) => state.user);
  const [internalDepartments, setInternalDepartments] = useState<Department[]>(departments);

  useEffect(() => {
    const fetchDepts = async () => {
      if (organization_id && (!departments || departments.length === 0)) {
        try {
          const depts = await graphqlService.getDepartments(organization_id);
          setInternalDepartments(depts);
        } catch (error) {
          console.error("Failed to fetch departments:", error);
        }
      }
    };
    fetchDepts();
  }, [organization_id, departments]);

  const handleSubmit = async (formData: any) => {
    if (!organization_id) {
      toast.error("Organization ID missing. Please log in again.");
      return;
    }

    try {
      await graphqlService.addIntern({
        ...formData,
        organization_id,
        createdBy: currentUserId
      });
      
      toast.success("Intern created successfully!");
      router.push(redirectPath);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create intern");
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-1">Fill in the details below to add a new intern to the system.</p>
      </div>

      <InternForm 
        mode="create" 
        departments={internalDepartments} 
        onSubmit={handleSubmit} 
      />
    </div>
  );
}

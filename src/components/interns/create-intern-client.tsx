"use client";

import { InternForm } from "@/components/forms/intern-form";
import { createIntern } from "@/lib/api/interns";
import { Department } from "@/lib/types";
import { useRouter } from "next/navigation";
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

  const handleSubmit = async (data: any) => {
    try {
      await createIntern(data);
      router.push(redirectPath);
      router.refresh();
    } catch (error) {
      console.error(error);
      // toast.error("Failed to create intern");
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
        departments={departments} 
        onSubmit={handleSubmit} 
      />
    </div>
  );
}

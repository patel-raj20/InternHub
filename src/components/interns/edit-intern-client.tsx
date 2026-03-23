"use client";

import { InternForm } from "@/components/forms/intern-form";
import { updateIntern } from "@/lib/api/interns";
import { Intern, Department } from "@/lib/types";
import { useRouter } from "next/navigation";

interface EditInternClientProps {
  intern: Intern;
  departments: Department[];
}

export default function EditInternClient({ intern, departments }: EditInternClientProps) {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    try {
      await updateIntern(intern.id, data);
      router.push("/super-admin/interns");
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Edit Intern</h1>
        <p className="text-muted-foreground mt-1">Update the profile and academic details for {intern.full_name}.</p>
      </div>

      <InternForm 
        mode="edit" 
        initialData={intern}
        departments={departments} 
        onSubmit={handleSubmit} 
      />
    </div>
  );
}

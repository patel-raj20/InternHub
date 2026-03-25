"use client";

import { DepartmentForm } from "@/components/forms/department-form";
import { createDepartment } from "@/lib/api/departments";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Building2, ShieldCheck } from "lucide-react";

export default function CreateDepartmentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: { name: string }) => {
    setIsLoading(true);
    try {
      await createDepartment("org1", { name: data.name });
      router.push("/super-admin/departments");
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <div className="mb-12 space-y-2">
        <div className="flex items-center gap-2 mb-2 group">
          <ShieldCheck className="w-4 h-4 text-primary neon-glow group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">System Configuration</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter leading-none flex items-center gap-3">
          Initialize <span className="text-primary">Department</span>
        </h1>
        <p className="text-muted-foreground font-medium text-lg max-w-xl">
          Create a new organizational unit to structure your intern teams and manage access controls.
        </p>
      </div>

      <DepartmentForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}

"use client";

import { DepartmentForm } from "@/components/forms/department-form";
import { graphqlService } from "@/lib/services/graphql-service";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import toast from "react-hot-toast";

export default function CreateDepartmentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { organization_id, id: currentUserId } = useSelector((state: RootState) => state.user);

  const handleSubmit = async (data: { name: string }) => {
    if (!organization_id) {
      toast.error("Organization ID missing.");
      return;
    }

    setIsLoading(true);
    try {
      await graphqlService.addDepartment({
        ...data,
        organization_id,
        createdBy: currentUserId,
        description: "", // Can be extended in form
      });
      toast.success("Department initialized successfully!");
      router.push("/super-admin/departments");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to initialize department.");
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

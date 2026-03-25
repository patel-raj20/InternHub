"use client";

import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Department } from "@/lib/types";
import { useEffect } from "react";

interface DepartmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Department | null;
}

export function DepartmentFormModal({ isOpen, onClose, onSubmit, initialData }: DepartmentFormModalProps) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        description: initialData.description,
      });
    } else {
      reset({ name: "", description: "" });
    }
  }, [initialData, reset, isOpen]);

  const handleFormSubmit = async (data: any) => {
    await onSubmit(data);
    onClose();
    reset();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Department" : "Add New Department"}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">
            Department Name
          </label>
          <Input 
            {...register("name", { required: "Name is required" })} 
            placeholder="e.g. Software Engineering" 
            className="h-12 border-border/50 focus:border-primary/50"
          />
          {errors.name && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.name.message as string}</p>}
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">
            Description
          </label>
          <Textarea 
            {...register("description")} 
            placeholder="Brief description of the department's role..." 
            className="min-h-[80px] border-border/50 focus:border-primary/50"
          />
        </div>

        <div className="pt-4 border-t border-border/30">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-6">Department Admin Details</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">First Name</label>
              <Input {...register("adminFirstName", { required: "First name is required" })} placeholder="Admin's first name" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">Last Name</label>
              <Input {...register("adminLastName", { required: "Last name is required" })} placeholder="Admin's last name" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">Admin Email</label>
              <Input {...register("adminEmail", { required: "Email is required" })} type="email" placeholder="admin@example.com" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">Admin Password</label>
              <Input {...register("adminPassword", { required: "Password is required" })} type="password" placeholder="Set temporary password" />
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-end pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-xl font-bold uppercase tracking-widest text-[10px]">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-[140px] rounded-xl font-black uppercase tracking-widest text-[10px] neon-glow">
            {isSubmitting ? "Saving..." : initialData ? "Update Department" : "Create Department"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

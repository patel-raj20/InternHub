"use client";

import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Department } from "@/lib/types";
import { useEffect, useState } from "react";
import { checkPasswordStrength } from "@/lib/password-utils";
import { PasswordChecklist } from "@/components/ui/password-checklist";
import { PasswordInput } from "@/components/ui/password-input";
import { gql } from "@apollo/client";
import { client } from "@/lib/apollo-client";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface DepartmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Department | null;
}

export function DepartmentFormModal({ isOpen, onClose, onSubmit, initialData }: DepartmentFormModalProps) {
  const [isPasswordSecure, setIsPasswordSecure] = useState(false);
  const { register, handleSubmit, reset, setError, watch, trigger, formState: { errors, isSubmitting, isValid } } = useForm({
    mode: "onChange"
  });

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
    // 1. Email Uniqueness Check (Only on Create)
    if (!initialData) {
      try {
        const { data: dbData } = await client.query({
          query: gql`query CheckEmail($email: String!) { users(where: { email: { _eq: $email } }) { id } }`,
          variables: { email: data.adminEmail },
          fetchPolicy: 'network-only'
        });
        if ((dbData?.users?.length || 0) > 0) {
          setError("adminEmail", { type: "manual", message: "This email is already in use by another account." });
          return;
        }
      } catch (err) {
        console.warn("Email uniqueness check failed:", err);
      }
    }

    if (!initialData && data.adminPassword) {
      const { isWeak, message } = await checkPasswordStrength(data.adminPassword);
      if (isWeak) {
        setError("adminPassword", { type: "manual", message });
        return;
      }
    }

    try {
      await onSubmit(data);
      onClose();
      reset();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to process department request");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Department" : "Add New Department"}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">
            Department Name <span className="text-red-500 ml-1">*</span>
          </label>
          <Input 
            {...register("name", { 
              required: "Name is required",
              pattern: { value: /^[A-Za-z\s.\-]+$/, message: "Only letters and spaces allowed" }
            })} 
            placeholder="e.g. Software Engineering" 
            className={cn("h-12 border-border/50 focus:border-primary/50", errors.name && "border-red-500/50")}
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

        {!initialData && (
          <div className="pt-4 border-t border-border/30">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-6">Department Admin Details</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">First Name <span className="text-red-500 ml-1">*</span></label>
                <Input 
                  {...register("adminFirstName", { 
                    required: !initialData ? "First name is required" : false,
                    pattern: { value: /^[A-Za-z\s]+$/, message: "Only letters allowed" }
                  })} 
                  placeholder="Admin's first name" 
                />
                {errors.adminFirstName && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.adminFirstName.message as string}</p>}
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">Last Name <span className="text-red-500 ml-1">*</span></label>
                <Input 
                  {...register("adminLastName", { 
                    required: !initialData ? "Last name is required" : false,
                    pattern: { value: /^[A-Za-z\s]+$/, message: "Only letters allowed" }
                  })} 
                  placeholder="Admin's last name" 
                />
                {errors.adminLastName && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.adminLastName.message as string}</p>}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">Admin Email <span className="text-red-500 ml-1">*</span></label>
                <Input 
                  {...register("adminEmail", { 
                    required: !initialData ? "Email is required" : false,
                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email format" }
                  })} 
                  type="email" 
                  placeholder="admin@example.com" 
                />
                {errors.adminEmail && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.adminEmail.message as string}</p>}
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">Admin Password <span className="text-red-500 ml-1">*</span></label>
                <PasswordInput 
                  {...register("adminPassword", { required: !initialData ? "Password is required" : false })} 
                  isSecure={isPasswordSecure}
                  placeholder="Set minimum 10 characters" 
                  autoComplete="new-password"
                />
                <PasswordChecklist 
                  password={watch("adminPassword")} 
                  onValidationChange={setIsPasswordSecure}
                />
                {errors.adminPassword && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.adminPassword.message as string}</p>}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <div className="flex gap-4 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl font-bold uppercase tracking-widest text-[10px]">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !isValid} 
              className={cn(
                "min-w-[140px] rounded-xl font-black uppercase tracking-widest text-[10px] neon-glow",
                !isValid && "opacity-50 grayscale"
              )}
            >
              {isSubmitting ? "Syncing..." : initialData ? "Update Department" : "Create Department"}
            </Button>
          </div>
          {!isValid && Object.keys(errors).length > 0 && (
            <p className="text-[9px] font-black uppercase tracking-widest text-red-500 text-right animate-pulse">
               Verification Error: Please fix the highlighted fields
            </p>
          )}
        </div>
      </form>
    </Modal>
  );
}

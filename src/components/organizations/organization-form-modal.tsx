"use client";

import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Organization } from "@/lib/types";
import { useEffect } from "react";

interface OrganizationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Organization | null;
}

export function OrganizationFormModal({ isOpen, onClose, onSubmit, initialData }: OrganizationFormModalProps) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        description: initialData.description,
        industry: initialData.industry,
        website: initialData.website,
        logo_url: initialData.logo_url,
      });
    }
  }, [initialData, reset, isOpen]);

  const handleFormSubmit = async (data: any) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Organization Details">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">
            Organization Name <span className="text-red-500 ml-1">*</span>
          </label>
          <Input 
            {...register("name", { required: "Name is required" })} 
            placeholder="Organization Name" 
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
            placeholder="Describe the organization..." 
            className="min-h-[80px] border-border/50 focus:border-primary/50"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">Industry</label>
            <Input {...register("industry")} placeholder="e.g. Technology" />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">Website</label>
            <Input {...register("website")} placeholder="https://..." />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">Logo URL</label>
          <Input {...register("logo_url")} placeholder="https://.../logo.png" />
        </div>

        <div className="flex gap-4 justify-end pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-xl font-bold uppercase tracking-widest text-[10px]">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-[140px] rounded-xl font-black uppercase tracking-widest text-[10px] neon-glow">
            {isSubmitting ? "Saving..." : "Update Organization"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

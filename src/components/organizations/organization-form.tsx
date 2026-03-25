"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Organization } from "@/lib/types";
import { useRouter } from "next/navigation";

interface OrganizationFormProps {
  mode: "create" | "edit";
  initialData?: Partial<Organization>;
  onSubmit: (data: any) => Promise<void>;
}

export function OrganizationForm({ mode, initialData, onSubmit }: OrganizationFormProps) {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: initialData || {},
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Organization Name</label>
            <Input {...register("name", { required: "Name is required" })} placeholder="Enter organization name" />
            {errors.name && <p className="text-[10px] text-red-500 font-bold">{errors.name.message as string}</p>}
          </div>
          
          <div className="space-y-3 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Description</label>
            <Textarea {...register("description")} placeholder="Describe the organization..." className="min-h-[100px]" />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Industry</label>
            <Input {...register("industry")} placeholder="e.g. Technology, Finance" />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Website</label>
            <Input {...register("website")} placeholder="https://example.com" />
          </div>

          <div className="space-y-3 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Logo URL</label>
            <Input {...register("logo_url")} placeholder="https://.../logo.png" />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting} className="min-w-[160px] neon-glow">
          {isSubmitting ? "Processing..." : mode === "create" ? "Add Organization" : "Update Organization"}
        </Button>
      </div>
    </form>
  );
}

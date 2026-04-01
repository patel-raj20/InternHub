"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Organization } from "@/lib/types";
import { useRouter } from "next/navigation";
import { checkPasswordStrength } from "@/lib/password-utils";
import { PasswordChecklist } from "@/components/ui/password-checklist";
import { PasswordInput } from "@/components/ui/password-input";
import { useState } from "react";

interface OrganizationFormProps {
  mode: "create" | "edit";
  initialData?: Partial<Organization>;
  onSubmit: (data: any) => Promise<void>;
}

export function OrganizationForm({ mode, initialData, onSubmit }: OrganizationFormProps) {
  const router = useRouter();
  const [isPasswordSecure, setIsPasswordSecure] = useState(false);
  const { 
    register, 
    handleSubmit, 
    reset, 
    setError, 
    watch, 
    trigger,
    formState: { errors, isSubmitting, isValid } 
  } = useForm<any>({
    mode: "onChange",
    defaultValues: initialData || {},
  });

  const handleFormSubmit = async (data: any) => {
    if (mode === "create" && data.adminPassword) {
      const { isWeak, message } = await checkPasswordStrength(data.adminPassword);
      if (isWeak) {
        setError("adminPassword", { type: "manual", message });
        return;
      }
    }
    await onSubmit(data);
  };

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="border-border/40 glass-card rounded-[2rem] overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
        
        <CardHeader className="bg-muted/30 border-b border-border/50 p-8">
          <CardTitle className="text-2xl font-black tracking-tighter uppercase">Organization Identity</CardTitle>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mt-1 opacity-60">Register new enterprise parameters</p>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 p-10">
          <div className="space-y-3 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">Organization Name <span className="text-red-500 ml-1">*</span></label>
            <Input 
              {...register("name", { 
                required: "Organization Name is required",
                minLength: { value: 3, message: "Must be at least 3 characters" },
                pattern: { value: /^[A-Za-z0-9\s.&'-]+$/, message: "Common alphanumeric and business characters only" }
              })} 
              placeholder="e.g. Global Tech Solutions" 
              className={cn(
                "h-12 rounded-xl bg-background/50 backdrop-blur-md border-border/50 focus:ring-primary/20 text-sm font-bold",
                errors.name ? "border-red-500/50" : ""
              )}
            />
            {errors.name && <p className="text-[10px] text-red-500 font-bold animate-in fade-in slide-in-from-top-1">{errors.name.message as string}</p>}
          </div>
          
          <div className="space-y-3 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Executive Summary</label>
            <Textarea 
              {...register("description", {
                validate: (v) => !v || v.length >= 20 || "Minimum 20 characters for a meaningful summary"
              })} 
              placeholder="Provide a high-level overview of the organization's mission..." 
              className={cn(
                "min-h-[120px] rounded-xl bg-background/50 backdrop-blur-md border-border/50 focus:ring-primary/20 font-medium leading-relaxed",
                errors.description ? "border-red-500/50" : ""
              )}
            />
            {errors.description && <p className="text-[10px] text-red-500 font-bold animate-in fade-in slide-in-from-top-1">{errors.description.message as string}</p>}
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Industry Sector</label>
            <Input 
              {...register("industry", { 
                required: "Industry Sector is required",
                minLength: { value: 2, message: "Must be at least 2 characters" }
              })} 
              placeholder="e.g. Information Technology" 
              className={cn(
                "h-12 rounded-xl bg-background/50 backdrop-blur-md border-border/50",
                errors.industry ? "border-red-500/50" : ""
              )}
            />
            {errors.industry && <p className="text-[10px] text-red-500 font-bold animate-in fade-in slide-in-from-top-1">{errors.industry.message as string}</p>}
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Digital Presence</label>
            <Input 
              {...register("website", {
                validate: (v) => !v || /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/.test(v) || "Please enter a valid URL (e.g. https://...)"
              })} 
              placeholder="https://organization.com" 
              className={cn(
                "h-12 rounded-xl bg-background/50 backdrop-blur-md border-border/50",
                errors.website ? "border-red-500/50" : ""
              )}
            />
            {errors.website && <p className="text-[10px] text-red-500 font-bold animate-in fade-in slide-in-from-top-1">{errors.website.message as string}</p>}
          </div>

          <div className="space-y-3 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Brand Logo Asset URL</label>
            <Input 
              {...register("logo_url", {
                validate: (v) => !v || /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/.test(v) || "Please enter a valid URL (e.g. https://...)"
              })} 
              placeholder="https://assets.cdn.com/logo-dark.png" 
              className={cn(
                "h-12 rounded-xl bg-background/50 backdrop-blur-md border-border/50",
                errors.logo_url ? "border-red-500/50" : ""
              )}
            />
            {errors.logo_url && <p className="text-[10px] text-red-500 font-bold animate-in fade-in slide-in-from-top-1">{errors.logo_url.message as string}</p>}
          </div>
        </CardContent>
      </Card>

      {mode === "create" && (
        <Card className="border-border/40 glass-card rounded-[2rem] overflow-hidden shadow-2xl relative">
          <CardHeader className="bg-muted/30 border-b border-border/50 p-8">
            <CardTitle className="text-2xl font-black tracking-tighter uppercase">Super Admin Credentials</CardTitle>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mt-1 opacity-60">Initial System Access</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 p-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">First Name <span className="text-red-500 ml-1">*</span></label>
              <Input 
                {...register("adminFirstName", { 
                  required: "First Name is required",
                  minLength: { value: 2, message: "Must be at least 2 characters" },
                  pattern: { value: /^[A-Za-z]+$/, message: "Alphabetic characters only" }
                })} 
                placeholder="e.g. John" 
                className={cn(
                  "h-12 rounded-xl bg-background/50 backdrop-blur-md border-border/50",
                  errors.adminFirstName ? "border-red-500/50" : ""
                )}
              />
              {errors.adminFirstName && <p className="text-[10px] text-red-500 font-bold animate-in fade-in slide-in-from-top-1">{errors.adminFirstName.message as string}</p>}
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Last Name <span className="text-red-500 ml-1">*</span></label>
              <Input 
                {...register("adminLastName", { 
                  required: "Last Name is required",
                  minLength: { value: 2, message: "Must be at least 2 characters" },
                  pattern: { value: /^[A-Za-z]+$/, message: "Alphabetic characters only" }
                })} 
                placeholder="e.g. Doe" 
                className={cn(
                  "h-12 rounded-xl bg-background/50 backdrop-blur-md border-border/50",
                  errors.adminLastName ? "border-red-500/50" : ""
                )}
              />
              {errors.adminLastName && <p className="text-[10px] text-red-500 font-bold animate-in fade-in slide-in-from-top-1">{errors.adminLastName.message as string}</p>}
            </div>
            <div className="space-y-3 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Admin Email <span className="text-red-500 ml-1">*</span></label>
              <Input 
                {...register("adminEmail", { 
                  required: "Email is required",
                  pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email format" }
                })} 
                type="email"
                placeholder="e.g. john.doe@organization.com" 
                className={cn(
                  "h-12 rounded-xl bg-background/50 backdrop-blur-md border-border/50",
                  errors.adminEmail ? "border-red-500/50" : ""
                )}
              />
              {errors.adminEmail && <p className="text-[10px] text-red-500 font-bold animate-in fade-in slide-in-from-top-1">{errors.adminEmail.message as string}</p>}
            </div>
            <div className="space-y-3 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Temporary Password <span className="text-red-500 ml-1">*</span></label>
              <PasswordInput 
                {...register("adminPassword", { 
                  required: mode === "create" ? "Password is required" : false,
                  minLength: { value: 10, message: "Minimum 10 characters required" }
                })} 
                isSecure={isPasswordSecure}
                placeholder="Must be at least 10 characters" 
                className={cn(
                  "h-12 rounded-xl bg-background/50 backdrop-blur-md border-border/50",
                  errors.adminPassword ? "border-red-500/50" : ""
                )}
                autoComplete="new-password"
              />
              <PasswordChecklist 
                password={watch("adminPassword") || ""} 
                onValidationChange={setIsPasswordSecure}
              />
              {errors.adminPassword && <p className="text-[10px] text-red-500 font-bold animate-in fade-in slide-in-from-top-1">{errors.adminPassword.message as string}</p>}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-4 items-end pt-4">
        <div className="flex gap-4 justify-end items-center">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={() => router.back()}
            className="rounded-xl px-10 h-12 font-bold text-muted-foreground hover:text-foreground transition-all"
          >
            Discard Changes
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || !isValid} 
            className={cn(
              "min-w-[200px] h-12 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 neon-glow transition-all",
              (!isValid || !isPasswordSecure) && mode === "create" ? "opacity-50 grayscale cursor-not-allowed" : ""
            )}
          >
            {isSubmitting ? "Syncing Parameters..." : mode === "create" ? "Initialize Organization" : "Commit Updates"}
          </Button>
        </div>
        {!isValid && Object.keys(errors).length > 0 && (
          <p className="text-[9px] font-black uppercase tracking-widest text-red-500 animate-pulse">
            Validation Error: Please fix the highlighted fields above
          </p>
        )}
      </div>
    </form>
  );
}

"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Intern, Department } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface InternFormProps {
  mode: "create" | "edit";
  initialData?: Partial<Intern>;
  departments: Department[];
  onSubmit: (data: any) => Promise<void>;
}

interface FormIntern extends Partial<Intern> {
  full_name?: string;
  email?: string;
  password?: string;
  phone?: string;
  enrollment_number?: string;
  dob?: string;
  blood_group?: string;
  [key: string]: any;
}

export function InternForm({ mode, initialData, departments, onSubmit }: InternFormProps) {
  const router = useRouter();
  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<FormIntern>({
    defaultValues: (initialData as FormIntern) || {
      status: "ACTIVE",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Account Credentials</CardTitle>
          <p className="text-xs text-muted-foreground">These details will be used for system authentication.</p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Full Name</label>
            <Input {...register("full_name", { required: "Name is required" })} placeholder="Enter full name" />
            {errors.full_name && <p className="text-[10px] text-red-500 font-bold">{errors.full_name.message as string}</p>}
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Email Address</label>
            <Input {...register("email", { required: "Email is required" })} type="email" placeholder="Enter email" />
            {errors.email && <p className="text-[10px] text-red-500 font-bold">{errors.email.message as string}</p>}
          </div>
          {mode === "create" && (
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Password</label>
              <Input {...register("password", { required: "Password is required" })} type="password" placeholder="Set password" />
              {errors.password && <p className="text-[10px] text-red-500 font-bold">{errors.password.message as string}</p>}
            </div>
          )}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Phone Number</label>
            <Input {...register("phone")} placeholder="Enter phone" />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Bio</label>
            <Input {...register("bio")} placeholder="Short introduction" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Academic Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">College Name</label>
            <Input {...register("college_name")} placeholder="e.g. VIT University" />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Degree</label>
            <Input {...register("degree")} placeholder="e.g. B.Tech" />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Specialization</label>
            <Input {...register("specialization")} placeholder="e.g. CSE" />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Graduation Year</label>
            <Input {...register("graduation_year", { valueAsNumber: true })} type="number" placeholder="2024" />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">CGPA</label>
            <Input {...register("cgpa", { valueAsNumber: true })} type="number" step="0.01" placeholder="9.0" />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">DOB</label>
            <Input {...register("dob")} type="date" />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Blood Group</label>
            <Input {...register("blood_group")} placeholder="e.g. A+" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skills & Certifications</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Skills (Comma separated)</label>
            <Input {...register("skills")} placeholder="e.g. React, Next.js, Node.js" />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Certifications (Comma separated)</label>
            <Input {...register("certifications")} placeholder="e.g. AWS Certified, Google Cloud" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Professional Links</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">GitHub URL</label>
            <Input {...register("github_url")} placeholder="https://github.com/..." />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">LinkedIn URL</label>
            <Input {...register("linkedin_url")} placeholder="https://linkedin.com/in/..." />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Portfolio URL</label>
            <Input {...register("portfolio_url")} placeholder="https://..." />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Location & Duration</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Address</label>
            <Input {...register("address")} placeholder="Enter full address" />
          </div>
          <div className="space-y-3 grid grid-cols-3 gap-2">
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">City</label>
               <Input {...register("city")} placeholder="City" />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">State</label>
               <Input {...register("state")} placeholder="State" />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Country</label>
               <Input {...register("country")} placeholder="Country" />
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Department</label>
            <Controller
              name="department_id"
              control={control}
              rules={{ required: "Department is required" }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className={cn(errors.department_id ? "border-red-500" : "")}>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.department_id && <p className="text-[10px] text-red-500 font-bold">{errors.department_id.message as string}</p>}
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Enrollment Number</label>
            <Input {...register("enrollment_number", { required: "Enrollment number is required" })} placeholder="Enter enrollment number" />
            {errors.enrollment_number && <p className="text-[10px] text-red-500 font-bold">{errors.enrollment_number.message as string}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-3">
               <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Joining Date</label>
               <Input {...register("joining_date", { required: "Joining date is required" })} type="date" />
             </div>
             <div className="space-y-3">
               <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">End Date</label>
               <Input {...register("end_date")} type="date" />
             </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
          {isSubmitting ? "Processing..." : mode === "create" ? "Create Intern" : "Update Intern"}
        </Button>
      </div>
    </form>
  );
}

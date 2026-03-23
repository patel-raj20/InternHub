"use client";

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

export function InternForm({ mode, initialData, departments, onSubmit }: InternFormProps) {
  const router = useRouter();
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm({
    defaultValues: initialData || {
      status: "ACTIVE",
      no_of_backlogs: 0,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Account & Basic Information</CardTitle>
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
            <Input {...register("phone")} placeholder="Enter phone (optional)" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">DOB</label>
            <Input {...register("dob")} type="date" />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Blood Group</label>
            <Input {...register("blood_group")} placeholder="e.g. A+" />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">No of Backlogs</label>
            <Input {...register("no_of_backlogs", { valueAsNumber: true })} type="number" min="0" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Academic & Professional Info</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <SelectItem key={dept.depart_id} value={dept.depart_id}>{dept.name}</SelectItem>
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
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Joining Date</label>
            <Input {...register("joining_date", { required: "Joining date is required" })} type="date" />
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

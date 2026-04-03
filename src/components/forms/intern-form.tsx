"use client";

import { useEffect, useState } from "react";
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
import { TagInput } from "@/components/ui/tag-input";
import { checkPasswordStrength } from "@/lib/password-utils";
import { client } from "@/lib/apollo-client";
import { gql } from "@apollo/client";
import { PasswordChecklist } from "@/components/ui/password-checklist";
import { PasswordInput } from "@/components/ui/password-input";

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
  const [isPasswordSecure, setIsPasswordSecure] = useState(false);
  const [cgpaScale, setCgpaScale] = useState<5 | 10>(10);
  const [isOngoing, setIsOngoing] = useState(initialData?.end_date === null || initialData?.end_date === "Present");
  const { register, handleSubmit, control, reset, setError, watch, trigger, setValue, formState: { errors, isSubmitting, isValid } } = useForm<FormIntern>({
    mode: "onChange",
    defaultValues: (initialData as FormIntern) || {
      status: "ACTIVE",
    },
  });

  const handleFormSubmit = async (data: any) => {
    if (mode === "create") {
      // Check password first
      if (data.password) {
        const { isWeak, message } = await checkPasswordStrength(data.password);
        if (isWeak) {
          setError("password", { type: "manual", message });
          return;
        }
      }
      
      // Check email uniqueness from DB
      if (data.email) {
        try {
          const { data: dbData } = await client.query<{ users: any[] }>({
             query: gql`query CheckEmail($email: String!) { users(where: { email: { _eq: $email } }) { id } }`,
             variables: { email: data.email },
             fetchPolicy: 'network-only'
          });
          if ((dbData?.users?.length || 0) > 0) {
             setError("email", { type: "manual", message: "This email is already in use by another account." });
             return;
          }
        } catch (err) {
          console.warn("Email uniqueness check failed online:", err);
          // Don't completely block if the network failed, just log it.
        }
      }
    }
    
    const sanitizeDate = (date?: string | null) => {
      if (!date || date === "" || date === "Present") return null;
      return date;
    };
    
    const finalData = { 
      ...data,
      graduation_year: data.graduation_year ? parseInt(data.graduation_year.toString(), 10) : undefined,
      cgpa: data.cgpa ? parseFloat(data.cgpa.toString()) : undefined,
      dob: sanitizeDate(data.dob),
      joining_date: sanitizeDate(data.joining_date),
      end_date: isOngoing ? null : sanitizeDate(data.end_date),
    };

    try {
      await onSubmit(finalData);
    } catch (error: any) {
      console.error("Form Submission Error:", error);
      toast.error(error.message || "An unexpected error occurred during submission.");
    }
  };

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Account Credentials</CardTitle>
          <p className="text-xs text-muted-foreground">These details will be used for system authentication.</p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Full Name <span className="text-red-500 ml-1">*</span></label>
            <Input 
              {...register("full_name", { 
                required: "Name is required",
                minLength: { value: 3, message: "Must be at least 3 characters" },
                pattern: { value: /^[a-zA-Z\s]*$/, message: "Only letters and spaces allowed" }
              })} 
              placeholder="Enter full name" 
            />
            {errors.full_name && <p className="text-[10px] text-red-500 font-bold">{errors.full_name.message as string}</p>}
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Email Address <span className="text-red-500 ml-1">*</span></label>
            <Input 
              {...register("email", { 
                required: "Email is required",
                pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email format" }
              })} 
              type="email" 
              placeholder="Enter email" 
            />
            {errors.email && <p className="text-[10px] text-red-500 font-bold">{errors.email.message as string}</p>}
          </div>
          {mode === "create" && (
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Password <span className="text-red-500 ml-1">*</span></label>
              <PasswordInput 
                {...register("password", { required: "Password is required" })} 
                isSecure={isPasswordSecure}
                placeholder="Set password (min 10 chars)" 
                autoComplete="new-password"
              />
              <PasswordChecklist 
                password={watch("password") || ""} 
                onValidationChange={setIsPasswordSecure}
              />
              {errors.password && <p className="text-[10px] text-red-500 font-bold">{errors.password.message as string}</p>}
            </div>
          )}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Phone Number</label>
            <Input 
              {...register("phone", {
                pattern: { value: /^\d{10}$/, message: "Must be exactly 10 digits" }
              })} 
              placeholder="Enter 10-digit phone" 
            />
            {errors.phone && <p className="text-[10px] text-red-500 font-bold">{errors.phone.message as string}</p>}
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Professional Summary</label>
            <Input {...register("bio")} placeholder="Short professional overview (Optional)" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Academic Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">College Name <span className="text-red-500 ml-1">*</span></label>
            <Input 
              {...register("college_name", { 
                required: "College Name is required",
                pattern: { value: /^[A-Za-z\s.\-]+$/, message: "Only letters and spaces allowed" }
              })} 
              placeholder="e.g. VIT University" 
            />
            {errors.college_name && <p className="text-[10px] text-red-500 font-bold">{errors.college_name.message as string}</p>}
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Degree <span className="text-red-500 ml-1">*</span></label>
            <Input 
              {...register("degree", { 
                required: "Degree is required",
                pattern: { value: /^[A-Za-z\s.\-]+$/, message: "Only letters and spaces allowed" }
              })} 
              placeholder="e.g. B.Tech" 
            />
            {errors.degree && <p className="text-[10px] text-red-500 font-bold">{errors.degree.message as string}</p>}
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Specialization <span className="text-red-500 ml-1">*</span></label>
            <Input 
              {...register("specialization", { 
                required: "Specialization is required",
                pattern: { value: /^[A-Za-z\s.\-]+$/, message: "Only letters and spaces allowed" }
              })} 
              placeholder="e.g. CSE" 
            />
            {errors.specialization && <p className="text-[10px] text-red-500 font-bold">{errors.specialization.message as string}</p>}
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Graduation Year <span className="text-red-500 ml-1">*</span></label>
            <Input 
              {...register("graduation_year", { 
                required: "Graduation Year is required",
                valueAsNumber: true
              })} 
              type="number" 
              placeholder="2024" 
            />
            {errors.graduation_year && <p className="text-[10px] text-red-500 font-bold">{errors.graduation_year.message as string}</p>}
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
               <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">CGPA <span className="text-red-500 ml-1">*</span></label>
               <div className="flex bg-muted/50 p-0.5 rounded-lg border border-border/50 items-center">
                 <button 
                   type="button" 
                   onClick={() => { setCgpaScale(10); trigger("cgpa"); }} 
                   className={cn("text-[9px] px-2 py-0.5 rounded-md font-bold transition-all", cgpaScale === 10 ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}
                 >Out of 10</button>
                 <button 
                   type="button" 
                   onClick={() => { setCgpaScale(5); trigger("cgpa"); }} 
                   className={cn("text-[9px] px-2 py-0.5 rounded-md font-bold transition-all", cgpaScale === 5 ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}
                 >Out of 5</button>
               </div>
            </div>
            <Input 
              {...register("cgpa", { 
                required: "CGPA is required",
                validate: (value) => {
                  const str = value?.toString();
                  if (!str) return "Required";
                  if (cgpaScale === 10) {
                     return /^(10(\.0{1,2})?|[0-9](\.\d{1,2})?)$/.test(str) || "Valid range 0-10 (e.g. 9.80)";
                  } else {
                     return /^(5(\.0{1,2})?|[0-4](\.\d{1,2})?)$/.test(str) || "Valid range 0-5 (e.g. 4.50)";
                  }
                }
              })} 
              type="number"
              step="0.01"
              onKeyDown={(e) => {
                if (['e', 'E', '+', '-'].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              placeholder={cgpaScale === 10 ? "9.0" : "4.0"} 
            />
            {errors.cgpa && <p className="text-[10px] text-red-500 font-bold">{errors.cgpa.message as string}</p>}
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">DOB <span className="text-red-500 ml-1">*</span></label>
            <Input 
              {...register("dob", { 
                required: "DOB is required",
                validate: (value) => {
                  if (!value) return true;
                  const selectedDate = new Date(value);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0); // Ignore time part for today
                  return selectedDate < today || "DOB must be a past date";
                }
              })} 
              type="date"
              max={new Date().toISOString().split("T")[0]} 
            />
            {errors.dob && <p className="text-[10px] text-red-500 font-bold">{errors.dob.message as string}</p>}
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
          <p className="text-xs text-muted-foreground mt-1">Type a skill/certification and press <kbd className="px-1 py-0.5 rounded bg-muted border border-border text-[10px] font-mono">Enter</kbd> or <kbd className="px-1 py-0.5 rounded bg-muted border border-border text-[10px] font-mono">,</kbd> to add it as a tag.</p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Skills <span className="text-red-500 ml-1">*</span></label>
            <Controller
              name="skills"
              control={control}
              rules={{ validate: (val) => (val && val.length > 0) || "At least one skill is required" }}
              render={({ field }) => (
                <div className="space-y-2">
                  <TagInput
                    value={Array.isArray(field.value) ? field.value : []}
                    onChange={field.onChange}
                    placeholder="e.g. React, Next.js, Node.js"
                    colorScheme="emerald"
                    hasError={!!errors.skills}
                  />
                  {errors.skills && <p className="text-[10px] text-red-500 font-bold">{errors.skills.message as string}</p>}
                </div>
              )}
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Certifications</label>
            <Controller
              name="certifications"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <TagInput
                    value={Array.isArray(field.value) ? field.value : []}
                    onChange={field.onChange}
                    placeholder="e.g. AWS Certified, Google Cloud"
                    colorScheme="violet"
                    hasError={!!errors.certifications}
                  />
                  {errors.certifications && <p className="text-[10px] text-red-500 font-bold">{errors.certifications.message as string}</p>}
                </div>
              )}
            />
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
            <Input 
              {...register("github_url", {
                validate: (v) => !v || /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/.test(v) || "Please enter a valid URL (e.g. https://github.com/...)"
              })} 
              placeholder="https://github.com/..." 
            />
            {errors.github_url && <p className="text-[10px] text-red-500 font-bold">{errors.github_url.message as string}</p>}
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">LinkedIn URL</label>
            <Input 
              {...register("linkedin_url", {
                validate: (v) => !v || /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/.test(v) || "Please enter a valid URL (e.g. https://linkedin.com/in/...)"
              })} 
              placeholder="https://linkedin.com/in/..." 
            />
            {errors.linkedin_url && <p className="text-[10px] text-red-500 font-bold">{errors.linkedin_url.message as string}</p>}
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Portfolio URL</label>
            <Input 
              {...register("portfolio_url", {
                validate: (v) => !v || /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/.test(v) || "Please enter a valid URL (e.g. https://...)"
              })} 
              placeholder="https://..." 
            />
            {errors.portfolio_url && <p className="text-[10px] text-red-500 font-bold">{errors.portfolio_url.message as string}</p>}
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
               <Input 
                 {...register("city", { 
                   pattern: { value: /^[A-Za-z\s]*$/, message: "Characters only" } 
                 })} 
                 placeholder="City" 
               />
               {errors.city && <p className="text-[10px] text-red-500 font-bold">{errors.city.message as string}</p>}
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">State</label>
               <Input 
                 {...register("state", { 
                   pattern: { value: /^[A-Za-z\s]*$/, message: "Characters only" } 
                 })} 
                 placeholder="State" 
               />
               {errors.state && <p className="text-[10px] text-red-500 font-bold">{errors.state.message as string}</p>}
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Country</label>
               <Input 
                 {...register("country", { 
                   pattern: { value: /^[A-Za-z\s]*$/, message: "Characters only" } 
                 })} 
                 placeholder="Country" 
               />
               {errors.country && <p className="text-[10px] text-red-500 font-bold">{errors.country.message as string}</p>}
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Internship Status <span className="text-red-500 ml-1">*</span></label>
            <Controller
              name="status"
              control={control}
              rules={{ required: "Status is required" }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className={cn("rounded-xl h-12 border-border/50", errors.status ? "border-red-500" : "")}>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.status && <p className="text-[10px] text-red-500 font-bold">{errors.status.message as string}</p>}
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Department <span className="text-red-500 ml-1">*</span></label>
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
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Enrollment Number <span className="text-red-500 ml-1">*</span></label>
            <Input {...register("enrollment_number", { required: "Enrollment number is required" })} placeholder="Enter enrollment number" />
            {errors.enrollment_number && <p className="text-[10px] text-red-500 font-bold">{errors.enrollment_number.message as string}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-3">
               <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Joining Date <span className="text-red-500 ml-1">*</span></label>
               <Input 
                 {...register("joining_date", { 
                   required: "Joining date is required",
                   onChange: () => trigger("end_date")
                 })} 
                 type="date" 
               />
               {errors.joining_date && <p className="text-[10px] text-red-500 font-bold">{errors.joining_date.message as string}</p>}
             </div>

             <div className="space-y-3">
               <div className="flex items-center justify-between">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">End Date</label>
                 <div className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      id="isOngoing"
                      checked={isOngoing}
                      onChange={(e) => {
                        setIsOngoing(e.target.checked);
                        if (e.target.checked) {
                          setValue("end_date", "");
                          trigger("end_date");
                        }
                      }}
                      className="w-3 h-3 rounded-sm accent-emerald-500"
                    />
                    <label htmlFor="isOngoing" className="text-[9px] font-bold uppercase tracking-wider text-emerald-600/80 cursor-pointer">Present</label>
                 </div>
               </div>
               <Input 
                 {...register("end_date", {
                   validate: (value) => {
                     if (isOngoing) return true;
                     if (!value) return true;
                     const joining = watch("joining_date");
                     if (!joining) return true;
                     return value > joining || "End date must be after joining date";
                   }
                 })} 
                 type="date" 
                 disabled={isOngoing}
                 className={isOngoing ? "opacity-30 grayscale cursor-not-allowed" : ""}
               />
               {errors.end_date && <p className="text-[10px] text-red-500 font-bold">{errors.end_date.message as string}</p>}
             </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 items-end">
        <div className="flex gap-4 justify-end">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || !isValid} 
            className={cn(
              "min-w-[140px] transition-all duration-300",
              !isValid && "opacity-50 grayscale cursor-not-allowed"
            )}
          >
            {isSubmitting ? "Processing..." : mode === "create" ? "Create Intern" : "Update Intern"}
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

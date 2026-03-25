"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Building2, Plus, Loader2 } from "lucide-react";

interface DepartmentFormProps {
  onSubmit: (data: { name: string }) => Promise<void>;
  isLoading?: boolean;
}

export function DepartmentForm({ onSubmit, isLoading }: DepartmentFormProps) {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="glass-card border-border/50 shadow-2xl overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">
            <Building2 className="w-4 h-4 text-primary" />
            Department Identity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
              Department Name
            </label>
            <div className="relative group">
              <Input
                {...register("name", { 
                  required: "Department name is required",
                  minLength: { value: 2, message: "Name must be at least 2 characters" }
                })}
                placeholder="e.g. Human Resources, Engineering..."
                className="h-12 bg-muted/20 border-border/50 focus:border-primary/50 transition-all font-bold tracking-tight pr-10"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary/50 transition-colors">
                <Plus size={16} />
              </div>
            </div>
            {errors.name && (
              <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight ml-1 animate-in fade-in slide-in-from-left-1">
                {errors.name.message}
              </p>
            )}
          </div>
          
          <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest leading-relaxed">
            Note: This name will be visible across the entire system for intern assignment and reporting.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-end pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.back()}
          className="h-11 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] border-border/50 hover:bg-muted transition-all"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading} 
          className="h-11 px-10 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg neon-glow scale-105 hover:scale-110 active:scale-95 transition-all min-w-[160px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            "Initialize Department"
          )}
        </Button>
      </div>
    </form>
  );
}

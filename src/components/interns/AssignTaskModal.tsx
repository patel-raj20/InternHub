"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { 
  X, 
  Send, 
  Calendar, 
  Layers, 
  Zap, 
  Type, 
  FileText,
  Loader2,
  Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { graphqlService } from "@/lib/services/graphql-service";

const schema = yup.object({
  title: yup.string().required("Title is required").min(3, "Too short"),
  description: yup.string().required("Description is required"),
  category: yup.string().required("Category is required"),
  difficulty: yup.string().required("Difficulty is required"),
  deadline: yup.string().required("Deadline is required"),
}).required();

interface AssignTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  internIds: string[]; // Supports single or bulk
  internNames?: string[];
  onSuccess?: () => void;
}

const CATEGORIES = [
  { value: "Development", label: "Development", icon: Zap, color: "text-blue-500" },
  { value: "Documentation", label: "Documentation", icon: FileText, color: "text-slate-500" },
  { value: "Design", label: "Design", icon: Layers, color: "text-pink-500" },
  { value: "Research", label: "Research", icon: Type, color: "text-purple-500" },
  { value: "QA", label: "Quality Assurance", icon: CheckSquare, color: "text-emerald-500" },
];

const DIFFICULTIES = [
  { value: "Easy", label: "Easy (+10 pts)", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", points: 10 },
  { value: "Medium", label: "Medium (+20 pts)", color: "bg-amber-500/10 text-amber-500 border-amber-500/20", points: 20 },
  { value: "Hard", label: "Hard (+40 pts)", color: "bg-red-500/10 text-red-500 border-red-500/20", points: 40 },
];

function CheckSquare(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  )
}

export function AssignTaskModal({ isOpen, onClose, internIds, internNames, onSuccess }: AssignTaskModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      category: "Development",
      difficulty: "Medium",
    }
  });

  const selectedDifficulty = watch("difficulty");

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const points = DIFFICULTIES.find(d => d.value === data.difficulty)?.points || 20;
      
      // Construct objects for bulk insert
      const taskObjects = internIds.map(internId => ({
        intern_id: internId,
        title: data.title,
        description: data.description,
        category: data.category,
        difficulty: data.difficulty,
        points_reward: points,
        deadline: new Date(data.deadline).toISOString(),
        status: 'pending'
      }));

      await graphqlService.batchInsertTasks(taskObjects);
      
      toast.success(`Task assigned to ${internIds.length} intern(s)!`);
      reset();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to assign task");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-primary/10 bg-card shadow-2xl"
        >
          {/* Header */}
          <div className="bg-primary/5 px-8 pt-8 pb-6 relative">
            <div className="absolute top-0 right-0 p-4">
               <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-primary/10 text-muted-foreground transition-colors"
               >
                 <X className="w-5 h-5" />
               </button>
            </div>
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">Assign New Task</h2>
                <p className="text-sm text-muted-foreground font-medium">Set goals and deadlines for interns.</p>
              </div>
            </div>

            {internIds.length > 1 && (
              <div className="mt-4 flex items-center gap-2 p-2 px-4 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                <Users className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Bulk Assignment: {internIds.length} Interns Selected
                </span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
            {/* Title & Description */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Task Title</Label>
                <Input
                  {...register("title")}
                  placeholder="e.g., Implement Login API"
                  className={cn(
                    "rounded-2xl border-primary/10 bg-muted/30 h-12 focus-visible:ring-primary",
                    errors.title && "border-red-500/50"
                  )}
                />
                {errors.title && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Instructions</Label>
                <Textarea
                  {...register("description")}
                  placeholder="Describe the task details and acceptance criteria..."
                  className={cn(
                    "rounded-2xl border-primary/10 bg-muted/30 min-h-[100px] focus-visible:ring-primary resize-none",
                    errors.description && "border-red-500/50"
                  )}
                />
                {errors.description && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.description.message}</p>}
              </div>
            </div>

            {/* Category & Difficulty */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Category</Label>
                <Select onValueChange={(val) => setValue("category", val)} defaultValue="Development">
                  <SelectTrigger className="rounded-2xl border-primary/10 bg-muted/30 h-12">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-primary/10">
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value} className="rounded-xl">
                        <div className="flex items-center gap-2">
                          <cat.icon className={cn("w-4 h-4", cat.color)} />
                          <span className="font-bold text-xs">{cat.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Difficulty</Label>
                 <Select onValueChange={(val) => setValue("difficulty", val)} defaultValue="Medium">
                  <SelectTrigger className="rounded-2xl border-primary/10 bg-muted/30 h-12">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-primary/10">
                    {DIFFICULTIES.map((diff) => (
                      <SelectItem key={diff.value} value={diff.value} className="rounded-xl">
                        <span className="font-bold text-xs">{diff.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Deadline */}
            <div className="space-y-2">
              <Label htmlFor="deadline" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Due Date & Time</Label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  {...register("deadline")}
                  type="datetime-local"
                  className={cn(
                    "rounded-2xl border-primary/10 bg-muted/30 h-12 pl-12 focus-visible:ring-primary",
                    errors.deadline && "border-red-500/50"
                  )}
                />
              </div>
              {errors.deadline && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.deadline.message}</p>}
            </div>

            {/* Footer / Reward Multiplier Info */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 border border-border/50">
               <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Estimated Reward</p>
                    <p className="text-sm font-black text-foreground">
                      {DIFFICULTIES.find(d => d.value === selectedDifficulty)?.points} Points
                    </p>
                  </div>
               </div>
               <Button 
                type="submit" 
                disabled={isSubmitting}
                className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase text-[10px] tracking-widest h-12 px-8 shadow-xl shadow-primary/20"
               >
                 {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                 Assign Task
               </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

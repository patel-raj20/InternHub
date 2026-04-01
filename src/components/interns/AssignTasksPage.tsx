"use client";

import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { graphqlService } from "@/lib/services/graphql-service";
import { Intern } from "@/lib/types";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  Search,
  CheckSquare,
  Square,
  Users,
  Zap,
  Send,
  Calendar,
  Layers,
  FileText,
  RotateCcw,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Filter,
  X,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const schema = yup.object({
  title: yup.string().required("Title is required").min(3, "Too short"),
  description: yup.string().required("Description is required"),
  category: yup.string().required("Category is required"),
  difficulty: yup.string().required("Difficulty is required"),
  deadline: yup.string().required("Deadline is required"),
}).required();

const CATEGORIES = [
  { value: "Development", label: "Development", color: "text-blue-500", bg: "bg-blue-500/10" },
  { value: "Documentation", label: "Documentation", color: "text-slate-500", bg: "bg-slate-500/10" },
  { value: "Design", label: "Design", color: "text-pink-500", bg: "bg-pink-500/10" },
  { value: "Research", label: "Research", color: "text-purple-500", bg: "bg-purple-500/10" },
  { value: "QA", label: "Quality Assurance", color: "text-emerald-500", bg: "bg-emerald-500/10" },
];

const DIFFICULTIES = [
  { value: "Easy", label: "Easy", pts: 10, color: "border-emerald-500/30 bg-emerald-500/5 text-emerald-500", dot: "bg-emerald-500" },
  { value: "Medium", label: "Medium", pts: 20, color: "border-amber-500/30 bg-amber-500/5 text-amber-500", dot: "bg-amber-500" },
  { value: "Hard", label: "Hard", pts: 40, color: "border-red-500/30 bg-red-500/5 text-red-500", dot: "bg-red-500" },
];

interface AssignTasksPageProps {
  mode: "ADMIN" | "SUPER_ADMIN";
}

export function AssignTasksPage({ mode }: AssignTasksPageProps) {
  const { organization_id, department_id } = useSelector((state: RootState) => state.user);
  const [interns, setInterns] = useState<Intern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("ALL");

  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { category: "Development", difficulty: "Medium" },
  });

  const selectedDifficulty = watch("difficulty");
  const selectedCategory = watch("category");

  useEffect(() => {
    const load = async () => {
      if (!organization_id) return;
      setIsLoading(true);
      try {
        const targetDept = mode === "ADMIN" ? department_id : undefined;
        const data = await graphqlService.getInterns(organization_id as string, targetDept as string | undefined);
        setInterns(data);
      } catch {
        toast.error("Failed to load interns");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [organization_id, department_id, mode]);

  const departments = useMemo(() => {
    const map = new Map<string, string>();
    interns.forEach(i => {
      if (i.user.department?.name) map.set(i.user.department_id || "", i.user.department.name);
    });
    return Array.from(map.entries());
  }, [interns]);

  const filtered = useMemo(() => {
    return interns.filter(i => {
      const name = `${i.user.first_name} ${i.user.last_name || ""}`.toLowerCase();
      const matchSearch = name.includes(search.toLowerCase()) || i.user.email.toLowerCase().includes(search.toLowerCase());
      const matchDept = filterDept === "ALL" || i.user.department_id === filterDept;
      return matchSearch && matchDept;
    });
  }, [interns, search, filterDept]);

  const toggleAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(i => i.id)));
    }
  };

  const toggle = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onSubmit = async (data: any) => {
    if (selectedIds.size === 0) {
      toast.error("Select at least one intern!");
      return;
    }
    setIsSubmitting(true);
    try {
      const pts = DIFFICULTIES.find(d => d.value === data.difficulty)?.pts || 20;
      const taskObjects = Array.from(selectedIds).map(internId => ({
        intern_id: internId,
        title: data.title,
        description: data.description,
        category: data.category,
        difficulty: data.difficulty,
        points_reward: pts,
        deadline: new Date(data.deadline).toISOString(),
        status: "pending",
      }));
      await graphqlService.batchInsertTasks(taskObjects);
      toast.success(`Task assigned to ${selectedIds.size} intern(s)! 🎯`);
      setDone(true);
    } catch (error: any) {
      console.error("Task Assignment Error:", error);
      const msg = error.graphQLErrors?.[0]?.message || error.message || "Failed to assign task";
      toast.error(`Error: ${msg}`, { duration: 5000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    reset();
    setSelectedIds(new Set());
    setDone(false);
    setSearch("");
  };

  const diffInfo = DIFFICULTIES.find(d => d.value === selectedDifficulty);
  const catInfo = CATEGORIES.find(c => c.value === selectedCategory);

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Assign Tasks</h1>
            <p className="text-sm text-muted-foreground font-medium">Select interns and define a gamified challenge for them.</p>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 gap-6 text-center glass-card rounded-[2.5rem] border-emerald-500/10"
          >
            <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center border-4 border-emerald-500/20 animate-pulse">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight">Tasks Assigned!</h2>
              <p className="text-muted-foreground font-medium">
                Successfully assigned to <span className="text-primary font-black">{selectedIds.size} intern(s)</span>.
              </p>
            </div>
            <Button onClick={handleReset} className="rounded-2xl h-12 px-8 font-black uppercase text-[10px] tracking-widest mt-4">
              <RotateCcw className="w-4 h-4 mr-2" /> Assign Another Task
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-5 gap-8"
          >
            {/* LEFT: Intern Selector */}
            <div className="lg:col-span-2 space-y-4">
              <div className="glass-card rounded-[2rem] border-border/50 overflow-hidden">
                {/* Selector Header */}
                <div className="p-5 border-b border-border/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Select Interns
                    </p>
                    {selectedIds.size > 0 && (
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                        <Users className="w-3 h-3 text-primary" />
                        <span className="text-[10px] font-black text-primary">{selectedIds.size} selected</span>
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search by name or email…"
                      className="pl-9 rounded-xl bg-muted/30 border-primary/10 h-10 text-sm"
                    />
                  </div>

                  {mode === "SUPER_ADMIN" && departments.length > 0 && (
                    <Select onValueChange={setFilterDept} defaultValue="ALL">
                      <SelectTrigger className="rounded-xl bg-muted/30 border-primary/10 h-10 text-xs">
                        <Filter className="w-3 h-3 mr-2 text-muted-foreground" />
                        <SelectValue placeholder="All Departments" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="ALL" className="rounded-xl text-xs font-bold">All Departments</SelectItem>
                        {departments.map(([id, name]) => (
                          <SelectItem key={id} value={id} className="rounded-xl text-xs font-bold">{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {/* Select All */}
                  <button
                    onClick={toggleAll}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {selectedIds.size === filtered.length && filtered.length > 0 ? "Deselect All" : "Select All"} ({filtered.length})
                    </span>
                    {selectedIds.size === filtered.length && filtered.length > 0
                      ? <CheckSquare className="w-4 h-4 text-primary" />
                      : <Square className="w-4 h-4 text-muted-foreground" />
                    }
                  </button>
                </div>

                {/* Intern List */}
                <div className="overflow-y-auto max-h-[480px] divide-y divide-border/30">
                  {isLoading ? (
                    <div className="flex justify-center py-16">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="py-16 text-center text-xs text-muted-foreground font-bold">No interns found</div>
                  ) : (
                    filtered.map(intern => {
                      const isSelected = selectedIds.has(intern.id);
                      return (
                        <button
                          key={intern.id}
                          onClick={() => toggle(intern.id)}
                          className={cn(
                            "w-full flex items-center gap-3 px-5 py-4 hover:bg-muted/30 transition-colors text-left",
                            isSelected && "bg-primary/5 hover:bg-primary/8"
                          )}
                        >
                          {/* Avatar */}
                          <div className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 border",
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary/30"
                              : "bg-muted text-muted-foreground border-border/50"
                          )}>
                            {intern.user.first_name[0]}{intern.user.last_name?.[0] || ""}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate">
                              {intern.user.first_name} {intern.user.last_name || ""}
                            </p>
                            <p className="text-[10px] text-muted-foreground/60 font-medium truncate">
                              {intern.user.email}
                            </p>
                          </div>

                          <div className={cn(
                            "transition-all",
                            isSelected ? "text-primary" : "text-muted-foreground/20"
                          )}>
                            {isSelected
                              ? <CheckSquare className="w-4 h-4" />
                              : <Square className="w-4 h-4" />
                            }
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT: Task Form */}
            <div className="lg:col-span-3">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="glass-card rounded-[2rem] border-border/50 p-8 space-y-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Task Details</p>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Title</Label>
                        <Input
                          {...register("title")}
                          placeholder="e.g., Implement Login API"
                          className={cn("rounded-2xl border-primary/10 bg-muted/30 h-12", errors.title && "border-red-500/50")}
                        />
                        {errors.title && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.title.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Description / Instructions</Label>
                        <Textarea
                          {...register("description")}
                          placeholder="Describe what the intern needs to do, deliverables, and acceptance criteria…"
                          className={cn("rounded-2xl border-primary/10 bg-muted/30 min-h-[120px] resize-none", errors.description && "border-red-500/50")}
                        />
                        {errors.description && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.description.message}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-border/40 w-full" />

                  {/* Category */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Category</p>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map(cat => (
                        <button
                          type="button"
                          key={cat.value}
                          onClick={() => setValue("category", cat.value)}
                          className={cn(
                            "px-4 py-2 rounded-xl border text-xs font-black transition-all",
                            selectedCategory === cat.value
                              ? `${cat.bg} ${cat.color} border-current shadow-sm`
                              : "bg-muted/30 text-muted-foreground border-border/50 hover:border-primary/20"
                          )}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Difficulty & Reward</p>
                    <div className="grid grid-cols-3 gap-3">
                      {DIFFICULTIES.map(diff => (
                        <button
                          type="button"
                          key={diff.value}
                          onClick={() => setValue("difficulty", diff.value)}
                          className={cn(
                            "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                            selectedDifficulty === diff.value
                              ? diff.color
                              : "border-border/50 bg-muted/20 text-muted-foreground hover:border-primary/20"
                          )}
                        >
                          <div className={cn("w-2.5 h-2.5 rounded-full", diff.dot)} />
                          <span className="text-xs font-black">{diff.label}</span>
                          <div className="flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            <span className="text-[10px] font-black">{diff.pts} pts</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Deadline */}
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Deadline</Label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        {...register("deadline")}
                        type="datetime-local"
                        className={cn(
                          "rounded-2xl border-primary/10 bg-muted/30 h-12 pl-12",
                          errors.deadline && "border-red-500/50"
                        )}
                      />
                    </div>
                    {errors.deadline && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.deadline.message}</p>}
                  </div>
                </div>

                {/* Submit Bar */}
                <div className={cn(
                  "flex items-center justify-between p-5 rounded-[2rem] border transition-all",
                  selectedIds.size > 0 ? "bg-primary/5 border-primary/20" : "bg-muted/30 border-border/50"
                )}>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2.5 rounded-xl transition-all",
                      selectedIds.size > 0 ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-muted text-muted-foreground"
                    )}>
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Assigning To</p>
                      <p className={cn("font-black text-sm", selectedIds.size > 0 ? "text-primary" : "text-muted-foreground")}>
                        {selectedIds.size > 0 ? `${selectedIds.size} Intern(s)` : "None selected"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Reward</p>
                      <p className="font-black text-sm text-primary flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 fill-primary/20" />
                        {diffInfo?.pts || 20} pts
                      </p>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting || selectedIds.size === 0}
                      className="h-12 px-8 rounded-2xl bg-primary font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      {isSubmitting ? "Assigning…" : "Assign Task"}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

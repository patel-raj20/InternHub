"use client";

import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { graphqlService } from "@/lib/services/graphql-service";
import { 
  LayoutGrid, 
  Search, 
  Filter, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Users, 
  Activity,
  ChevronRight,
  ExternalLink,
  Zap,
  MoreVertical,
  Loader2,
  Trash2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const formatDate = (date: string | Date, pattern: string = "PPP") => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  
  if (pattern === "PPP") {
    return new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(d);
  }
  
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(d);
};

interface TaskMonitoringPageProps {
  mode: "ADMIN" | "SUPER_ADMIN";
}

interface GroupedTask {
  key: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  deadline: string;
  createdAt: string;
  totalAssigned: number;
  completedCount: number;
  interns: {
    id: string;
    fullName: string;
    email: string;
    status: string;
    completedAt?: string;
    department?: string;
  }[];
}

export function TaskMonitoringPage({ mode }: TaskMonitoringPageProps) {
  const { organization_id, department_id } = useSelector((state: RootState) => state.user);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [selectedGroup, setSelectedGroup] = useState<GroupedTask | null>(null);
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [organization_id, department_id, mode]);

  const loadData = async () => {
    if (!organization_id) return;
    setLoading(true);
    try {
      // 1. Fetch Departments (if Super Admin)
      if (mode === "SUPER_ADMIN") {
        const depts = await graphqlService.getDepartments(organization_id);
        setDepartments(depts);
      }

      // 2. Build Where Clause
      const where: any = {};
      if (mode === "ADMIN") {
        where.intern = { user: { department_id: { _eq: department_id } } };
      } else {
        where.intern = { organization_id: { _eq: organization_id } };
      }

      // 3. Fetch Tasks
      const data = await graphqlService.getAllTasks(where);
      setTasks(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  // --- Grouping Logic ---
  const groupedTasks = useMemo(() => {
    const groups: Record<string, GroupedTask> = {};

    tasks.forEach(task => {
      // Create a unique key for grouping bulk assignments
      const key = `${task.title}-${task.category}-${task.created_at}`;
      
      if (!groups[key]) {
        groups[key] = {
          key,
          title: task.title,
          description: task.description,
          category: task.category,
          difficulty: task.difficulty,
          deadline: task.deadline,
          createdAt: task.created_at,
          totalAssigned: 0,
          completedCount: 0,
          interns: []
        };
      }

      groups[key].totalAssigned++;
      if (task.status === "completed") groups[key].completedCount++;
      
      groups[key].interns.push({
        id: task.intern.id,
        fullName: `${task.intern.user.first_name} ${task.intern.user.last_name}`,
        email: task.intern.user.email,
        status: task.status,
        completedAt: task.completed_at,
        department: task.intern.user.department?.name
      });
    });

    return Object.values(groups).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [tasks]);

  // --- Filtering Logic ---
  const filteredGroups = useMemo(() => {
    return groupedTasks.filter(group => {
      const matchSearch = group.title.toLowerCase().includes(search.toLowerCase()) || 
                          group.description.toLowerCase().includes(search.toLowerCase());
      
      const matchStatus = filterStatus === "ALL" || 
                         (filterStatus === "COMPLETED" && group.completedCount === group.totalAssigned) ||
                         (filterStatus === "PENDING" && group.completedCount < group.totalAssigned);

      // Check if any intern in the group matches the department filter (mostly relevant for Super Admin)
      const matchDept = filterDept === "ALL" || group.interns.some(i => i.department === filterDept);

      return matchSearch && matchStatus && matchDept;
    });
  }, [groupedTasks, search, filterStatus, filterDept]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === "completed").length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, completionRate };
  }, [tasks]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm font-bold text-muted-foreground animate-pulse uppercase tracking-widest">Loading task data...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 space-y-8 pb-24">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
              <LayoutGrid className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter">Task Monitoring</h1>
          </div>
          <p className="text-muted-foreground font-medium ml-1">
            Real-time tracking of intern performance and bulk assignments.
          </p>
        </div>

      </div>

      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search task title or description..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-14 rounded-[1.25rem] bg-background border-border/50 focus:ring-primary/20"
          />
        </div>
        
        <div className="flex flex-wrap gap-3">
          {mode === "SUPER_ADMIN" && (
            <Select onValueChange={setFilterDept} defaultValue="ALL">
              <SelectTrigger className="w-[200px] h-14 rounded-[1.25rem] bg-background border-border/50">
                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                <SelectItem value="ALL" className="font-bold">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.name} className="font-bold">{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select onValueChange={setFilterStatus} defaultValue="ALL">
            <SelectTrigger className="w-[180px] h-14 rounded-[1.25rem] bg-background border-border/50">
              <Activity className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Status Filter" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectItem value="ALL" className="font-bold">All Status</SelectItem>
              <SelectItem value="COMPLETED" className="font-bold">Fully Completed</SelectItem>
              <SelectItem value="PENDING" className="font-bold">Action Needed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Task Groups List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 glass-card rounded-[2.5rem] border-dashed text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-xl font-bold tracking-tight">No tasks found</h3>
            <p className="text-sm text-muted-foreground font-medium">Try adjusting your search or filters.</p>
          </div>
        ) : (
          filteredGroups.map(group => {
            const progress = Math.round((group.completedCount / group.totalAssigned) * 100);
            
            return (
              <motion.div 
                key={group.key} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                layout
              >
                <Card className="group overflow-hidden rounded-[2.5rem] border-border/50 hover:border-primary/30 transition-all duration-300 bg-background/50 hover:shadow-2xl hover:shadow-primary/5">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch">
                      {/* Left Side: Main Info */}
                      <div className="flex-1 p-8 space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-2xl font-black tracking-tight">{group.title}</h3>
                          
                          <Badge className={cn(
                            "rounded-lg px-3 py-1 font-black uppercase text-[10px] tracking-widest border-none",
                            group.difficulty === "Easy" ? "bg-emerald-500/10 text-emerald-600" :
                            group.difficulty === "Medium" ? "bg-amber-500/10 text-amber-600" :
                            "bg-red-500/10 text-red-600"
                          )}>
                            {group.difficulty}
                          </Badge>

                          <Badge className="rounded-lg px-3 py-1 bg-primary/10 text-primary font-black uppercase text-[10px] tracking-widest border-none shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]">
                            Bulk Group ({group.totalAssigned})
                          </Badge>
                        </div>

                        <p className="text-muted-foreground font-medium leading-relaxed max-w-2xl line-clamp-2">
                          {group.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-6 pt-2">
                          {/* Avatars */}
                          <div className="flex -space-x-3">
                            {group.interns.slice(0, 5).map((intern, i) => (
                              <div 
                                key={intern.id}
                                className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-black"
                                title={intern.fullName}
                              >
                                {intern.fullName[0]}
                              </div>
                            ))}
                            {group.interns.length > 5 && (
                              <div className="w-8 h-8 rounded-full border-2 border-background bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-black">
                                +{group.interns.length - 5}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-xl border border-border/50">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span className="text-xs font-black uppercase tracking-tight">
                              {formatDate(group.deadline)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-xl border border-border/50">
                            <Zap className="w-4 h-4 text-amber-500" />
                            <span className="text-xs font-black uppercase tracking-tight">
                              {group.category}
                            </span>
                          </div>
                        </div>

                        {/* Task-Specific Stats Row */}
                        <div className="grid grid-cols-4 gap-2 pt-4 w-full md:max-w-md">
                          <div className="px-3 py-2 rounded-xl bg-background border border-border/50 shadow-sm text-center">
                            <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Total</p>
                            <p className="text-sm font-black">{group.totalAssigned}</p>
                          </div>
                          <div className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                            <p className="text-[8px] font-black uppercase tracking-widest text-emerald-600">Done</p>
                            <p className="text-sm font-black text-emerald-600">{group.completedCount}</p>
                          </div>
                          <div className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center text-amber-600">
                            <p className="text-[8px] font-black uppercase tracking-widest ">Pending</p>
                            <p className="text-sm font-black">{group.totalAssigned - group.completedCount}</p>
                          </div>
                          <div className="px-3 py-2 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 text-center">
                            <p className="text-[8px] font-black uppercase tracking-widest opacity-70">Rate</p>
                            <p className="text-sm font-black">{Math.round((group.completedCount / group.totalAssigned) * 100)}%</p>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Progress & Actions */}
                      <div className="w-full md:w-80 p-8 border-t md:border-t-0 md:border-l border-border/50 flex flex-col justify-center gap-6 bg-muted/10 group-hover:bg-primary/5 transition-colors">
                        <div className="space-y-2">
                          <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/50">Completion</span>
                            <span className="text-2xl font-black text-primary">{progress}%</span>
                          </div>
                          <div className="h-3 w-full bg-muted rounded-full overflow-hidden border border-border/50 p-0.5">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"
                            />
                          </div>
                          <p className="text-[10px] text-foreground/60 font-black text-center pt-1 tracking-widest uppercase">
                            {group.completedCount} of {group.totalAssigned} Completed
                          </p>
                        </div>

                        <Button 
                          onClick={() => setSelectedGroup(group)}
                          className="w-full h-14 rounded-2xl bg-background text-foreground border border-border/50 hover:bg-primary hover:text-primary-foreground transition-all duration-300 font-black uppercase text-[10px] tracking-[0.2em] group/btn shadow-sm"
                        >
                          View Details
                          <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Drill-down Modal */}
      <Modal 
        isOpen={!!selectedGroup} 
        onClose={() => setSelectedGroup(null)} 
        title={selectedGroup?.title || "Task Details"}
      >
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="rounded-lg px-2 py-0.5 bg-primary/10 text-primary border-none text-[10px] font-black uppercase tracking-widest">
              Task Drill-down
            </Badge>
            <p className="text-xs font-medium text-muted-foreground pt-1">
              Assigned on {selectedGroup?.createdAt && formatDate(selectedGroup.createdAt)}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 max-h-[60vh] overflow-y-auto pr-2 momentum-scroll">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 ml-1">Individual Progress</p>
            {selectedGroup?.interns.map(intern => (
              <div 
                key={intern.id} 
                className={cn(
                  "flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border transition-all",
                  intern.status === "completed" 
                    ? "bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]" 
                    : "bg-muted/30 border-border/50"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center font-black transition-all",
                    intern.status === "completed" ? "bg-emerald-500 text-white shadow-lg" : "bg-muted text-muted-foreground"
                  )}>
                    {intern.fullName[0]}
                  </div>
                  <div>
                    <h4 className="font-black text-sm">{intern.fullName}</h4>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      {intern.department || "No Department"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 sm:mt-0 flex flex-col sm:items-end gap-2">
                  <Badge className={cn(
                    "rounded-lg px-3 py-1 font-black uppercase text-[10px] tracking-widest border-none",
                    intern.status === "completed" ? "bg-emerald-500 text-white" : "bg-primary/20 text-primary"
                  )}>
                    {intern.status}
                  </Badge>
                  {intern.status === "completed" && intern.completedAt && (
                    <p className="text-[10px] text-emerald-600 font-bold tracking-tight">
                       Done at: {formatDate(intern.completedAt, "short")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={() => setSelectedGroup(null)} className="h-12 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest">
              Close Report
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Helper to provide framer-motion in a clean way for the components
import { motion } from "framer-motion";

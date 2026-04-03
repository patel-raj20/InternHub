"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from "@/store";
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, Search, Building2,
  Calendar, CheckCircle2, Clock, AlertCircle,
  LayoutGrid, ChevronRight, UserPlus, Filter
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { graphqlService } from "@/lib/services/graphql-service";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import DelegateTaskModal from "@/components/dashboard/DelegateTaskModal";
import { Intern } from "@/lib/types";
import { useRouter } from "next/navigation";

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  COMPLETED: { label: "Completed", color: "text-emerald-500", bg: "bg-emerald-500/10", icon: <CheckCircle2 size={14} /> },
  ASSIGNED: { label: "Delegated", color: "text-primary", bg: "bg-primary/10", icon: <Clock size={14} /> },
  PENDING: { label: "Pending", color: "text-amber-500", bg: "bg-amber-500/10", icon: <AlertCircle size={14} /> },
};

export default function DeptAdminTasksPage() {
  const router = useRouter();
  const { department_id } = useSelector((state: RootState) => state.user);
  
  const [tasks, setTasks] = useState<any[]>([]);
  const [interns, setInterns] = useState<Intern[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("PENDING");
  const [isDelegateOpen, setIsDelegateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const fetchData = async () => {
    if (!department_id) return;
    setLoading(true);
    try {
      const [data, internsData] = await Promise.all([
        graphqlService.getDepartmentTasksForAdmin(department_id),
        graphqlService.getInterns(undefined, department_id)
      ]);
      setTasks(data);
      setInterns(internsData);
    } catch (error) {
      console.error("Fetch Data Error:", error);
      toast.error("Failed to load department data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [department_id]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Use null-safe title/description with fallbacks to master_task
      const title = (task.title || task.master_task?.title || '').toLowerCase();
      const description = (task.description || task.master_task?.description || '').toLowerCase();
      const query = searchQuery.toLowerCase();
      
      const matchesSearch = title.includes(query) || description.includes(query);
      const matchesTab = task.status === activeTab;
      
      return matchesSearch && matchesTab;
    });
  }, [tasks, searchQuery, activeTab]);

  const stats = useMemo(() => ({
    pending: tasks.filter(t => t.status === 'PENDING').length,
    assigned: tasks.filter(t => t.status === 'ASSIGNED').length,
    completed: tasks.filter(t => t.status === 'COMPLETED').length,
  }), [tasks]);

  const handleOpenProgress = (task: any) => {
    router.push(`/admin/department-tasks/${task.id}`);
  };

  const handleDelegateClick = (task: any) => {
    const title = task.title || task.master_task?.title || 'Untitled';
    const description = task.description || task.master_task?.description || '';
    const deadline = task.deadline || task.master_task?.deadline;
    
    setSelectedTask({
      ...task,
      title,
      description,
      deadline
    });
    setIsDelegateOpen(true);
  };

  return (
    <div className="container mx-auto py-10 px-6 space-y-10 animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">Department Intelligence</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none uppercase">
            Task Management
          </h1>
          <p className="text-muted-foreground/70 font-medium max-w-2xl leading-relaxed text-sm">
            Oversee and delegate strategic master tasks assigned to your department. Track intern-level progress in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end px-4 border-r border-border/40">
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Efficiency</span>
            <span className="text-xl font-black text-primary">
              {stats.completed + stats.assigned > 0 
                ? Math.round((stats.completed / (stats.completed + stats.assigned + stats.pending)) * 100) 
                : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-muted/20 p-2 rounded-[2rem] border border-border/40">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full lg:w-auto">
          <TabsList className="bg-transparent h-12 gap-1 p-1">
            <TabsTrigger value="PENDING" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Inbox ({stats.pending})
            </TabsTrigger>
            <TabsTrigger value="ASSIGNED" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Delegated ({stats.assigned})
            </TabsTrigger>
            <TabsTrigger value="COMPLETED" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Finalized ({stats.completed})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full lg:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Filter tasks by name or metadata..." 
            className="pl-12 h-12 bg-background border-border/40 rounded-2xl text-[11px] font-bold uppercase tracking-wider focus-visible:ring-primary/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tasks Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <Card key={i} className="h-64 animate-pulse bg-muted/20 border-border/30 rounded-[2rem]" />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <Card className="border-dashed border-2 border-border/30 bg-muted/5 py-24 text-center rounded-[2.5rem]">
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-muted/30 flex items-center justify-center text-muted-foreground/30 border border-border/30">
              <ClipboardList size={32} />
            </div>
            <h3 className="text-xl font-black tracking-tight uppercase">No Tasks Found</h3>
            <p className="text-xs font-bold text-muted-foreground/40 max-w-xs">
              Either your inbox is clear or no tasks match your current filter criteria.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {filteredTasks.map((task, i) => {
              const sc = STATUS_CFG[task.status] || STATUS_CFG['PENDING'];
              const title = task.title || task.master_task?.title || 'Untitled Strategic Task';
              const description = task.description || task.master_task?.description || 'Strategic organizational objective assigned for department execution.';
              const deadline = task.deadline || task.master_task?.deadline;

              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="group"
                >
                  <Card className="border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-[0_10px_30px_rgba(0,122,255,0.05)] overflow-hidden glass-card flex flex-col md:flex-row items-center rounded-[2rem]">
                    <CardHeader 
                      className="flex-1 space-y-3 p-8 border-b md:border-b-0 md:border-r border-border/50 cursor-pointer hover:bg-primary/[0.02] transition-colors"
                      onClick={() => handleOpenProgress(task)}
                    >
                      <div className="flex items-center gap-3">
                         <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest border border-current/20 ${sc.bg} ${sc.color}`}>
                           {task.status}
                         </span>
                         <span className="text-primary/60 font-black text-[8px] uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                           <LayoutGrid size={10} /> View Real-time Visuals
                         </span>
                      </div>
                      <CardTitle className="text-2xl font-black tracking-tighter uppercase leading-none group-hover:text-primary transition-colors">
                         {title}
                      </CardTitle>
                      <CardDescription className="text-xs font-bold leading-relaxed text-muted-foreground/70 max-w-2xl line-clamp-2">
                         {description}
                      </CardDescription>
                    </CardHeader>

                    <div className="p-8 flex flex-col md:flex-row items-center gap-8 bg-primary/[0.01]">
                       <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-1 w-32">
                          <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Target Deadline</div>
                          <div className="text-[11px] font-black flex items-center gap-2">
                             <Calendar size={12} className="text-primary" />
                             {deadline 
                               ? new Date(deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) 
                               : 'TBD'}
                          </div>
                       </div>

                       <div className="flex items-center gap-3">
                        <Button 
                          variant="outline"
                          size="icon"
                          className="rounded-xl border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all w-12 h-12"
                          onClick={() => handleOpenProgress(task)}
                        >
                          <ChevronRight size={18} className="text-primary" />
                        </Button>
                        
                        {task.status === 'PENDING' ? (
                          <Button 
                            onClick={() => handleDelegateClick(task)}
                            className="h-12 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/10"
                          >
                            Process Task
                          </Button>
                        ) : (
                          <Button 
                            variant="secondary" 
                            className="h-12 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest bg-muted/50 border border-border/50"
                            onClick={() => handleOpenProgress(task)}
                          >
                            Monitor Progress
                          </Button>
                        )}
                       </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
      
      <DelegateTaskModal
        isOpen={isDelegateOpen}
        onClose={() => {
          setIsDelegateOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        interns={interns}
        onSuccess={() => {
          fetchData();
        }}
      />
    </div>
  );
}

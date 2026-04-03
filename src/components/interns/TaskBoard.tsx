"use client";

import { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Zap, 
  AlertCircle, 
  ChevronRight, 
  Calendar,
  Lock,
  Trophy,
  Loader2,
  Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface Task {
  id: string;
  title?: string;
  description?: string;
  status: 'pending' | 'completed';
  category: string;
  difficulty: string;
  points_reward: number;
  deadline?: string;
  completed_at?: string;
  created_at: string;
  department_task?: {
    title?: string;
    description?: string;
    deadline?: string;
    master_task?: {
      title?: string;
      description?: string;
      deadline?: string;
    }
  }
}

interface TaskBoardProps {
  internId: string;
  onTaskCompleted?: (rewards: any) => void;
}

export function TaskBoard({ internId, onTaskCompleted }: TaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('PENDING');
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/intern/tasks/list?internId=${internId}`); // Optional: We need this API endpoint
      // Alternatively, use GraphQL directly if available in hook
      // For now, let's assume we have a simple fetch
      const data = await res.json();
      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [internId]);

  const handleComplete = async (taskId: string) => {
    setCompletingTaskId(taskId);
    try {
      const res = await fetch(`/api/intern/tasks/${taskId}/complete`, { method: 'POST' });
      const data = await res.json();
      
      if (data.success) {
        toast.success(`Task completed! +${data.pointsEarned} pts ✨`);
        if (data.awardedBadge) {
          toast(`Awarded Badge: ${data.awardedBadge} 🏅`, { icon: '🏆' });
        }
        
        // Update local state
        setTasks(prev => prev.map(t => 
          t.id === taskId ? { ...t, status: 'completed', completed_at: new Date().toISOString() } : t
        ));
        
        onTaskCompleted?.(data);
      } else {
        toast.error(data.error || "Failed to complete task");
      }
    } catch (error) {
       toast.error("An error occurred");
    } finally {
      setCompletingTaskId(null);
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'ALL') return true;
    return t.status.toLowerCase() === filter.toLowerCase();
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tighter uppercase leading-none mb-1">Active Assignments</h2>
            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] ml-0.5">Track your progress here</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1.5 bg-muted/40 rounded-2xl border border-border/50 backdrop-blur-sm">
           {(['PENDING', 'COMPLETED', 'ALL'] as const).map((f) => (
             <button
               key={f}
               onClick={() => setFilter(f)}
               className={cn(
                 "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                 filter === f 
                  ? "bg-background text-primary shadow-xl shadow-primary/10 border border-border/50 scale-[1.02]" 
                  : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/60"
               )}
             >
               {f}
             </button>
           ))}
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="py-32 flex flex-col items-center justify-center text-center space-y-6">
           <div className="relative group">
              <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl scale-[2.5] group-hover:scale-[3] transition-transform duration-700 opacity-60" />
              <div className="relative w-24 h-24 rounded-[2rem] bg-background border border-border/50 flex items-center justify-center shadow-xl mb-2">
                 <Calendar className="w-10 h-10 text-muted-foreground/40" />
              </div>
           </div>
           <div className="space-y-2">
              <h3 className="text-xl font-black uppercase tracking-tighter">No tasks assigned yet</h3>
              <p className="text-sm text-muted-foreground/60 font-medium max-w-[280px]">Check back later for new goals or contact your department admin!</p>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredTasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                isCompleting={completingTaskId === task.id}
                onComplete={() => handleComplete(task.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

interface Task {
  id: string;
  title?: string;
  description?: string;
  status: 'pending' | 'completed';
  category: string;
  difficulty: string;
  points_reward: number;
  deadline?: string;
  completed_at?: string;
  parent_dept_task_id?: string;
  created_at: string;
  department_task?: {
    title?: string;
    description?: string;
    deadline?: string;
    master_task?: {
      title?: string;
      description?: string;
      deadline?: string;
    }
  }
}

// ... existing TaskBoard component logic ...
function TaskCard({ task, onComplete, isCompleting }: { task: Task; onComplete: () => void; isCompleting: boolean }) {
  const title = task.title || task.department_task?.title || task.department_task?.master_task?.title || 'Untitled Objective';
  const description = task.description || task.department_task?.description || task.department_task?.master_task?.description || 'Strategic task content...';
  const deadline = task.deadline || task.department_task?.deadline || task.department_task?.master_task?.deadline;

  const isOverdue = deadline ? new Date(deadline) < new Date() && task.status === 'pending' : false;
  const isCompleted = task.status === 'completed';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Card className={cn(
        "h-full rounded-[2rem] border-border/50 bg-card/40 backdrop-blur-xl overflow-hidden transition-all duration-500",
        isCompleted && "opacity-80 border-emerald-500/10 grayscale-[0.2]",
        isOverdue && "border-red-500/20"
      )}>
        <CardContent className="p-6 h-full flex flex-col">
          {/* Top Info */}
          <div className="flex justify-between items-start mb-4">
             <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Badge className={cn(
                    "w-fit uppercase text-[8px] font-black tracking-widest",
                     isCompleted ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary"
                  )}>
                    {task.category}
                  </Badge>
                  {task.parent_dept_task_id && (
                    <Badge className="text-[7px] font-black uppercase tracking-tighter bg-amber-500/5 text-amber-500 border border-amber-500/20 hover:bg-amber-500/10">
                      Departmental
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                   <div className={cn(
                     "w-1.5 h-1.5 rounded-full",
                     task.difficulty === 'Easy' ? "bg-emerald-500" : task.difficulty === 'Medium' ? "bg-amber-500" : "bg-red-500"
                   )} />
                   <span className="text-[10px] font-bold text-muted-foreground lowercase">{task.difficulty}</span>
                </div>
             </div>
             
             <div className="flex flex-col items-end">
                <div className="flex items-center gap-1 text-primary">
                   <Zap className="w-3.5 h-3.5 fill-primary/20" />
                   <span className="text-sm font-black">{task.points_reward}</span>
                </div>
                <span className="text-[8px] font-black uppercase text-muted-foreground">Worth</span>
             </div>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-2 mb-6">
            <h3 className={cn(
              "text-lg font-black tracking-tight line-clamp-1 group-hover:text-primary transition-colors",
              isCompleted && "line-through text-muted-foreground/60"
            )}>
              {title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Footer UI */}
          <div className="pt-4 border-t border-border/50 space-y-4">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <div className={cn(
                    "p-1.5 rounded-lg",
                    isOverdue ? "bg-red-500/10 text-red-500" : "bg-muted text-muted-foreground"
                  )}>
                    <Clock className="w-3 h-3" />
                  </div>
                  <div className="flex flex-col leading-none">
                     <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">
                       {isCompleted ? "Completed At" : "Deadline"}
                     </span>
                     <span className={cn(
                       "text-[10px] font-bold",
                       isOverdue ? "text-red-500/80" : "text-muted-foreground/60"
                     )}>
                      <span className={cn(
                        "text-[10px] font-bold",
                        isOverdue ? "text-red-500/80" : "text-muted-foreground/60"
                      )}>
                        {deadline ? new Date(isCompleted ? task.completed_at! : deadline).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'No deadline set'}
                      </span>
                     </span>
                  </div>
               </div>
               
               {isCompleted ? (
                 <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-500">
                   <CheckCircle2 className="w-5 h-5" />
                 </div>
               ) : (
                 <Button 
                   onClick={onComplete}
                   disabled={isCompleting || isOverdue}
                   size="sm"
                   className="h-9 px-4 rounded-xl bg-foreground text-background hover:bg-primary hover:text-primary-foreground font-black uppercase text-[10px] tracking-widest transition-all"
                 >
                   {isCompleting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Complete"}
                 </Button>
               )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

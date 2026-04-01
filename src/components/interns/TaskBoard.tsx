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
  title: string;
  description: string;
  status: 'pending' | 'completed';
  category: string;
  difficulty: string;
  points_reward: number;
  deadline: string;
  completed_at?: string;
  created_at: string;
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-black tracking-tight">Active Assignments</h2>
        </div>

        <div className="flex items-center gap-1 p-1 bg-muted rounded-2xl border border-border/50">
           {(['PENDING', 'COMPLETED', 'ALL'] as const).map((f) => (
             <button
               key={f}
               onClick={() => setFilter(f)}
               className={cn(
                 "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                 filter === f ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
               )}
             >
               {f}
             </button>
           ))}
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="p-20 text-center glass-card rounded-[2rem] border-dashed border-2 border-border/50">
           <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 opacity-50">
              <Calendar className="w-8 h-8 text-muted-foreground" />
           </div>
           <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No tasks assigned yet</p>
           <p className="text-xs text-muted-foreground/60 mt-1">Check back later for new goals!</p>
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

function TaskCard({ task, onComplete, isCompleting }: { task: Task; onComplete: () => void; isCompleting: boolean }) {
  const isOverdue = new Date(task.deadline) < new Date() && task.status === 'pending';
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
                <Badge className={cn(
                  "w-fit uppercase text-[8px] font-black tracking-widest",
                   isCompleted ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary"
                )}>
                  {task.category}
                </Badge>
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
              {task.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {task.description}
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
                        {new Date(isCompleted ? task.completed_at! : task.deadline).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
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

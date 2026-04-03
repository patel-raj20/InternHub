"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, CheckCircle2, 
  Clock, Users, ChevronRight,
  TrendingUp, AlertCircle, LayoutGrid
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DepartmentTask } from "@/lib/types";
import { graphqlService } from "@/lib/services/graphql-service";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface SubTask {
  id: string;
  status: 'pending' | 'completed';
  completed_at?: string;
  intern: {
    id: string;
    user: {
      first_name: string;
      last_name: string;
      email: string;
    };
  };
}

export default function DepartmentTaskProgressPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  
  const [task, setTask] = useState<any>(null);
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const [taskData, subtasksData] = await Promise.all([
          graphqlService.getDepartmentTaskById(id),
          graphqlService.getSubtasksProgress(id)
        ]);
        
        if (!taskData) {
          toast.error("Telemetry failure: Task node unbound or unavailable");
          router.push('/admin/department-tasks');
          return;
        }

        const title = taskData.title || taskData.master_task?.title || 'Untitled Strategic Task';
        const description = taskData.description || taskData.master_task?.description || 'Strategic organizational objective assigned for department execution.';

        setTask({
            ...taskData,
            title,
            description
        });
        setSubtasks(subtasksData);
      } catch (err) {
        console.error(err);
        toast.error("Telemetry failure: Could not link to executing nodes");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  if (loading && !task) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4 py-32 min-h-[60vh]">
         <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
         <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Linking telemetry systems...</span>
      </div>
    );
  }

  if (!task) return null;

  const total = subtasks.length;
  const completed = subtasks.filter(s => s?.status?.toLowerCase() === 'completed').length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="max-w-5xl mx-auto py-10 px-6 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Back Button */}
      <Button
        variant="ghost"
        className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-primary transition-colors -ml-3"
        onClick={() => router.push('/admin/department-tasks')}
      >
        <ArrowLeft size={16} /> Department Inbox
      </Button>

      {/* Header telemetry module */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <Card className="border-border/50 shadow-2xl glass-card overflow-hidden flex flex-col relative">
           <CardHeader className="relative border-b border-border/10 bg-primary/5 pb-10">
             
             <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-6 pt-12">
                <div className="space-y-4">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">Visual Tracking Stream</span>
                   </div>
                   <CardTitle className="text-3xl font-black tracking-tight uppercase leading-tight py-1">{task.title}</CardTitle>
                   <p className="text-xs font-bold text-muted-foreground/60 max-w-lg leading-relaxed italic">{task.description}</p>
                </div>

                {/* Top Stats Summary */}
                <div className="flex items-center gap-8">
                   <div className="text-right">
                      <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Execution Ratio</div>
                      <div className="text-2xl font-black">{completed} <span className="text-muted-foreground/30">/</span> {total}</div>
                   </div>
                   <div className="h-10 w-px bg-border/20" />
                   <div className="text-right">
                      <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Health Status</div>
                      <div className={`text-sm font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm border border-current/10 ${
                        progress === 100 ? "bg-emerald-500/10 text-emerald-500" : 
                        progress > 0 ? "bg-primary/10 text-primary" : 
                        "bg-amber-500/10 text-amber-500"
                      }`}>
                         {progress === 100 ? "Finalized" : progress > 0 ? "Operational" : "Synchronizing"}
                      </div>
                   </div>
                </div>
             </div>

             {/* Global Progress Bar */}
             <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/20">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-primary shadow-[0_0_15px_var(--primary)]"
                />
             </div>
           </CardHeader>

           {/* Content Area */}
           <CardContent className="flex-1 p-0">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center space-y-4 py-32">
                   <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Linking execution nodes...</span>
                </div>
              ) : subtasks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-6">
                   <div className="w-20 h-20 rounded-[2.5rem] bg-muted/20 flex items-center justify-center text-muted-foreground/20 border border-border/50">
                      <Users size={40} />
                   </div>
                   <div className="space-y-2">
                      <h3 className="text-xl font-black uppercase tracking-tight">No Delegation Detected</h3>
                      <p className="text-xs text-muted-foreground/60 font-bold uppercase tracking-widest leading-relaxed max-w-sm">
                         This master task has been assigned to the department but has not yet been delegated to individual interns.
                      </p>
                   </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
                   {subtasks.map((st) => (
                      <Card key={st.id} className="border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden group hover:border-primary/50 transition-colors">
                         <CardContent className="p-6 space-y-6">
                            <div className="flex items-start justify-between gap-4">
                               <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-10 h-10 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs border border-primary/20">
                                     {st.intern?.user?.first_name?.[0]}{st.intern?.user?.last_name?.[0]}
                                  </div>
                                  <div className="min-w-0">
                                     <div className="text-[11px] font-black tracking-tight truncate">{st.intern?.user?.first_name} {st.intern?.user?.last_name}</div>
                                     <div className="text-[9px] text-muted-foreground/60 font-bold uppercase tracking-wider truncate">Execution Node</div>
                                  </div>
                               </div>
                               
                               <div className={`p-2 rounded-lg border border-current/10 shrink-0 ${
                                 st?.status?.toLowerCase() === 'completed' ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary animate-pulse"
                               }`}>
                                  {st?.status?.toLowerCase() === 'completed' ? <CheckCircle2 size={16} /> : <TrendingUp size={16} />}
                               </div>
                            </div>

                            <div className="space-y-4">
                               <div className="flex items-center justify-between border-t border-border/10 pt-4">
                                  <div className="flex items-center gap-2">
                                     <Clock size={12} className="text-muted-foreground/40" />
                                     <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Status</span>
                                  </div>
                                  <span className={`text-[10px] font-black uppercase tracking-widest ${
                                    st?.status?.toLowerCase() === 'completed' ? "text-emerald-500" : "text-primary"
                                  }`}>
                                     {st.status}
                                  </span>
                               </div>

                               {st?.status?.toLowerCase() === 'completed' && st.completed_at && (
                                  <div className="flex items-center justify-between border-t border-border/10 pt-4">
                                     <div className="flex items-center gap-2">
                                        <CheckCircle2 size={12} className="text-emerald-500/60" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Finalized On</span>
                                     </div>
                                     <span className="text-[10px] font-black uppercase tracking-widest text-foreground">
                                        {new Date(st.completed_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                     </span>
                                  </div>
                               )}
                            </div>
                         </CardContent>
                      </Card>
                   ))}
                </div>
              )}
           </CardContent>

           {/* Footer Info */}
           <div className="p-6 bg-primary/[0.02] border-t border-border/10 flex items-center gap-4">
              <div className="bg-amber-500/10 p-2.5 rounded-xl text-amber-500 border border-amber-500/20">
                 <AlertCircle size={18} />
              </div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase leading-relaxed tracking-wider">
                 Note: The visuals reflect real-time telemetry from delegated intern assignments. If an intern is not listed, the department manager has not yet assigned them this task node.
              </p>
           </div>
        </Card>
      </motion.div>
    </div>
  );
}

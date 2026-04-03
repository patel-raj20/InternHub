"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, Users, CheckCircle2, Clock, AlertCircle, Calendar, BarChart2, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { graphqlService } from "@/lib/services/graphql-service";
import toast from "react-hot-toast";

interface DeptTaskAssignment {
  id: string;
  department_id: string;
  status: string;
  tasks: {
    id: string;
    title: string;
    status: string;
    completed_at: string | null;
    intern: {
      id: string;
      user: { first_name: string; last_name: string; email: string };
    };
  }[];
}

interface MasterTask {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: string;
  created_at: string;
  department_tasks: DeptTaskAssignment[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  masterTaskId: string | null;
  departments: { id: string; name: string }[];
}

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode; bg: string }> = {
  COMPLETED: { color: "text-emerald-500", bg: "bg-emerald-500/10", icon: <CheckCircle2 size={14} /> },
  IN_PROGRESS: { color: "text-blue-500", bg: "bg-blue-500/10", icon: <Clock size={14} /> },
  ASSIGNED:   { color: "text-primary", bg: "bg-primary/10", icon: <Clock size={14} /> },
  PENDING:    { color: "text-amber-500", bg: "bg-amber-500/10", icon: <AlertCircle size={14} /> },
};

export default function MasterTaskDetailModal({ isOpen, onClose, masterTaskId, departments }: Props) {
  const [task, setTask] = useState<MasterTask | null>(null);
  const [loading, setLoading] = useState(false);

  const deptMap = useMemo(() => {
    const m: Record<string, string> = {};
    departments.forEach(d => { m[d.id] = d.name; });
    return m;
  }, [departments]);

  useEffect(() => {
    if (!isOpen || !masterTaskId) return;
    setTask(null);
    setLoading(true);
    graphqlService.getMasterTaskDetail(masterTaskId)
      .then(setTask)
      .catch(() => toast.error("Failed to load task details"))
      .finally(() => setLoading(false));
  }, [isOpen, masterTaskId]);

  const stats = useMemo(() => {
    if (!task) return { total: 0, completed: 0, inProgress: 0, pending: 0, depts: 0 };
    const allTasks = task.department_tasks.flatMap(dt => dt.tasks);
    return {
      total: allTasks.length,
      completed: allTasks.filter(t => t.status?.toLowerCase() === 'completed').length,
      inProgress: allTasks.filter(t => t.status?.toLowerCase() === 'in_progress').length,
      pending: allTasks.filter(t => t.status?.toLowerCase() === 'pending').length,
      depts: task.department_tasks.length,
    };
  }, [task]);

  const completionPct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-start justify-center bg-background/80 backdrop-blur-xl overflow-y-auto py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.97 }}
          transition={{ type: "spring", damping: 25 }}
          className="w-full max-w-4xl"
        >
          <Card className="border-border/50 shadow-2xl glass-card overflow-hidden">
            {/* Header */}
            <CardHeader className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 border-b border-border/20">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4 rounded-full"
                onClick={onClose}
              >
                <X size={18} />
              </Button>
              <div className="space-y-4 pr-10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">Master Task Intelligence</span>
                </div>
                <CardTitle className="text-3xl font-black tracking-tighter uppercase leading-none">
                  {loading ? "Loading..." : task?.title || "—"}
                </CardTitle>
                {task && (
                  <p className="text-sm text-muted-foreground/70 font-medium leading-relaxed max-w-2xl">{task.description}</p>
                )}
                {task && (
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                    <Calendar size={12} />
                    Deadline: {new Date(task.deadline).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-24">
                  <Loader2 size={32} className="animate-spin text-primary" />
                </div>
              ) : task ? (
                <div className="divide-y divide-border/20">

                  {/* Stats Bar */}
                  <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border/20">
                    {[
                      { label: "Departments", value: stats.depts, icon: <Building2 size={16}/>, color: "text-primary" },
                      { label: "Total Interns", value: stats.total, icon: <Users size={16}/>, color: "text-blue-500" },
                      { label: "Completed", value: stats.completed, icon: <CheckCircle2 size={16}/>, color: "text-emerald-500" },
                      { label: "Pending", value: stats.pending + stats.inProgress, icon: <Clock size={16}/>, color: "text-amber-500" },
                    ].map(s => (
                      <div key={s.label} className="p-6 text-center space-y-2">
                        <div className={`flex justify-center ${s.color}`}>{s.icon}</div>
                        <div className="text-2xl font-black">{s.value}</div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Overall Progress */}
                  <div className="p-8 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                        <BarChart2 size={12} className="text-primary" /> Overall Completion
                      </div>
                      <span className="text-sm font-black text-primary">{completionPct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
                        initial={{ width: 0 }}
                        animate={{ width: `${completionPct}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>

                  {/* Per-Department Breakdown */}
                  <div className="p-8 space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                      <Building2 size={12} /> Department Breakdown
                    </h3>
                    {task.department_tasks.length === 0 ? (
                      <p className="text-sm text-muted-foreground/40 font-bold">No departments assigned yet.</p>
                    ) : (
                      task.department_tasks.map((dt) => {
                        const deptCompleted = dt.tasks.filter(t => t.status?.toLowerCase() === 'completed').length;
                        const deptTotal = dt.tasks.length;
                        const deptPct = deptTotal > 0 ? Math.round((deptCompleted / deptTotal) * 100) : 0;
                        const s = STATUS_CONFIG[dt.status?.toUpperCase()] || STATUS_CONFIG['PENDING'];
                        return (
                          <div key={dt.id} className="space-y-4">
                            {/* Dept Header */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-[10px] text-primary">
                                  {(deptMap[dt.department_id] || 'D')[0]}
                                </div>
                                <div>
                                  <div className="text-sm font-black">{deptMap[dt.department_id] || dt.department_id}</div>
                                  <div className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">{deptTotal} intern{deptTotal !== 1 ? 's' : ''} assigned</div>
                                </div>
                              </div>
                              <span className={`text-[9px] font-black px-2 py-1 rounded-lg border border-current/20 uppercase tracking-widest ${s.color} ${s.bg}`}>
                                {dt.status}
                              </span>
                            </div>

                            {/* Dept Progress Bar */}
                            <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden ml-11">
                              <motion.div
                                className="h-full rounded-full bg-emerald-500/60"
                                initial={{ width: 0 }}
                                animate={{ width: `${deptPct}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                              />
                            </div>

                            {/* Intern List */}
                            {dt.tasks.length > 0 && (
                              <div className="ml-11 grid grid-cols-1 md:grid-cols-2 gap-2">
                                {dt.tasks.map(t => {
                                  const ts = STATUS_CONFIG[t.status?.toUpperCase()] || STATUS_CONFIG['PENDING'];
                                  return (
                                    <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/30">
                                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${ts.bg} ${ts.color} flex-shrink-0`}>
                                        {ts.icon}
                                      </div>
                                      <div className="min-w-0">
                                        <div className="text-xs font-black truncate">
                                          {t.intern?.user?.first_name} {t.intern?.user?.last_name}
                                        </div>
                                        <div className={`text-[9px] font-black uppercase tracking-widest ${ts.color}`}>{t.status}</div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {dt.tasks.length === 0 && (
                              <p className="ml-11 text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest">No interns assigned yet — awaiting delegation</p>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-24 text-muted-foreground/40">
                  <p className="text-sm font-bold">Failed to load task data</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

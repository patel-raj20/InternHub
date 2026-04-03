"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Building2, Users, CheckCircle2, Clock,
  AlertCircle, Calendar, BarChart2, Loader2, Trash2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { graphqlService } from "@/lib/services/graphql-service";
import DeleteConfirmationModal from "@/components/dashboard/DeleteConfirmationModal";
import toast from "react-hot-toast";

interface InternTask {
  id: string;
  title: string;
  status: string;
  completed_at: string | null;
  intern: { id: string; user: { first_name: string; last_name: string; email: string } };
}

interface DeptAssignment {
  id: string;
  department_id: string;
  status: string;
  tasks: InternTask[];
}

interface MasterTask {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: string;
  created_at: string;
  department_tasks: DeptAssignment[];
}

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  COMPLETED: { label: "Completed", color: "text-emerald-500", bg: "bg-emerald-500/10", icon: <CheckCircle2 size={14} /> },
  IN_PROGRESS:{ label: "In Progress",color: "text-blue-500",   bg: "bg-blue-500/10",   icon: <Clock size={14} /> },
  ASSIGNED:   { label: "Assigned",  color: "text-primary",     bg: "bg-primary/10",    icon: <Clock size={14} /> },
  PENDING:    { label: "Pending",   color: "text-amber-500",   bg: "bg-amber-500/10",  icon: <AlertCircle size={14} /> },
};

export default function MasterTaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { organization_id } = useSelector((state: RootState) => state.user);

  const [task, setTask] = useState<MasterTask | null>(null);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const deptPromise = organization_id
      ? graphqlService.getDepartments(organization_id)
      : Promise.resolve([]);
    Promise.all([
      graphqlService.getMasterTaskDetail(id),
      deptPromise,
    ])
      .then(([taskData, deptsData]) => {
        setTask(taskData);
        setDepartments(deptsData);
      })
      .catch(() => toast.error('Failed to load task details'))
      .finally(() => setLoading(false));
  }, [id, organization_id]);

  // If we don't have org_id from context, get depts from the task's dept_ids
  const deptMap = useMemo(() => {
    const m: Record<string, string> = {};
    departments.forEach(d => { m[d.id] = d.name; });
    return m;
  }, [departments]);

  const stats = useMemo(() => {
    if (!task) return { total: 0, completed: 0, inProgress: 0, pending: 0 };
    const all = task.department_tasks.flatMap(dt => dt.tasks);
    return {
      total: all.length,
      completed: all.filter(t => t?.status?.toLowerCase() === 'completed').length,
      inProgress: all.filter(t => t?.status?.toLowerCase() === 'in_progress').length,
      pending: all.filter(t => t?.status?.toLowerCase() === 'pending').length,
    };
  }, [task]);

  const completionPct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await graphqlService.deleteMasterTask(id);
      toast.success("Master task deleted successfully");
      router.push('/super-admin/tasks');
    } catch {
      toast.error("Failed to delete task");
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="animate-spin text-primary" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Loading Task Intelligence...</span>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <AlertCircle size={48} className="mx-auto text-muted-foreground/30" />
          <p className="font-black uppercase text-muted-foreground/40">Task not found</p>
          <Button onClick={() => router.back()} variant="outline" className="rounded-xl">Go Back</Button>
        </div>
      </div>
    );
  }

  const sc = STATUS_CFG[task?.status?.toUpperCase()] || STATUS_CFG['PENDING'];

  return (
    <div className="max-w-5xl mx-auto py-10 px-6 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Back + Header */}
      <div className="space-y-6">
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-primary transition-colors -ml-3"
          onClick={() => router.push('/super-admin/tasks')}
        >
          <ArrowLeft size={16} /> Master Tasks
        </Button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">Task Intelligence Report</span>
              <span className={`flex items-center gap-1.5 text-[9px] font-black px-2.5 py-1 rounded-lg border border-current/20 uppercase tracking-widest ${sc.color} ${sc.bg}`}>
                {sc.icon} {sc.label}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none uppercase">
              {task.title}
            </h1>
            <p className="text-muted-foreground/70 font-medium max-w-2xl leading-relaxed">{task.description}</p>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
              <Calendar size={12} />
              Deadline: {new Date(task.deadline).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          <Button
            variant="outline"
            className="flex items-center gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 rounded-xl font-black uppercase text-[10px] tracking-widest flex-shrink-0"
            onClick={() => setIsDeleteOpen(true)}
          >
            <Trash2 size={14} /> Delete Task
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Departments", value: task.department_tasks.length, icon: <Building2 size={20} />, color: "text-primary",     bg: "bg-primary/10"     },
          { label: "Total Interns", value: stats.total,     icon: <Users size={20} />,        color: "text-blue-500",   bg: "bg-blue-500/10"   },
          { label: "Completed",     value: stats.completed, icon: <CheckCircle2 size={20} />, color: "text-emerald-500",bg: "bg-emerald-500/10" },
          { label: "Pending",       value: stats.pending + stats.inProgress, icon: <Clock size={20} />, color: "text-amber-500", bg: "bg-amber-500/10" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Card className="border-border/30 overflow-hidden">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${s.bg} ${s.color} border border-current/20`}>
                  {s.icon}
                </div>
                <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">{s.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Overall Progress */}
      <Card className="border-border/30">
        <CardContent className="p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest">
              <BarChart2 size={14} className="text-primary" /> Overall Completion
            </div>
            <span className="text-2xl font-black text-primary">{completionPct}%</span>
          </div>
          <div className="h-3 rounded-full bg-muted/30 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
              initial={{ width: 0 }}
              animate={{ width: `${completionPct}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </div>
          <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
            {stats.completed} of {stats.total} intern tasks completed across {task.department_tasks.length} department{task.department_tasks.length !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>

      {/* Per-Department Breakdown */}
      <div className="space-y-6">
        <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
          <Building2 size={12} /> Department Breakdown
        </h2>

        {task.department_tasks.map((dt, idx) => {
          const dCompleted = dt.tasks.filter(t => t?.status?.toLowerCase() === 'completed').length;
          const dTotal = dt.tasks.length;
          const dPct = dTotal > 0 ? Math.round((dCompleted / dTotal) * 100) : 0;
          const isDeptCompleted = dTotal > 0 && dCompleted === dTotal;
          const ds = isDeptCompleted ? STATUS_CFG['COMPLETED'] : (STATUS_CFG[dt?.status?.toUpperCase()] || STATUS_CFG['PENDING']);
          const deptName = deptMap[dt.department_id] || `Dept ${dt.department_id.slice(0, 6)}`;

          return (
            <motion.div
              key={dt.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
            >
              <Card className={`border-border/30 overflow-hidden transition-all duration-500 ${isDeptCompleted ? 'border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.05)] bg-emerald-500/[0.02]' : ''}`}>
                <CardContent className="p-0">
                  {/* Dept Header */}
                  <div className={`flex items-center justify-between p-6 border-b border-border/20 ${isDeptCompleted ? 'bg-emerald-500/5' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center font-black text-sm ${isDeptCompleted ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-500' : 'bg-primary/10 border-primary/20 text-primary'}`}>
                        {deptName[0]}
                      </div>
                      <div>
                        <div className="font-black text-base uppercase tracking-tight flex items-center gap-2">
                          {deptName}
                          {isDeptCompleted && <CheckCircle2 size={14} className="text-emerald-500" />}
                        </div>
                        <div className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest mt-0.5">
                          {dTotal} intern{dTotal !== 1 ? 's' : ''} · {dCompleted} completed · {dPct}%
                        </div>
                      </div>
                    </div>
                    <span className={`flex items-center gap-1.5 text-[9px] font-black px-3 py-1.5 rounded-lg border border-current/20 uppercase tracking-widest ${ds.color} ${ds.bg}`}>
                      {ds.icon} {ds.label}
                    </span>
                  </div>

                  {/* Dept Progress Bar */}
                  <div className="h-1 bg-muted/20">
                    <motion.div
                      className="h-full bg-emerald-500/60"
                      initial={{ width: 0 }}
                      animate={{ width: `${dPct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.08 }}
                    />
                  </div>

                  {/* Intern List */}
                  {dTotal === 0 ? (
                    <div className="p-6 text-center">
                      <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest">
                        No interns assigned yet — awaiting delegation from Department Admin
                      </p>
                    </div>
                  ) : (
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {dt.tasks.map(t => {
                        const ts = STATUS_CFG[t?.status?.toUpperCase()] || STATUS_CFG['PENDING'];
                        return (
                          <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/20 hover:border-primary/20 transition-colors">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${ts.bg} ${ts.color} border border-current/20`}>
                              {ts.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-black truncate">
                                {t.intern?.user?.first_name} {t.intern?.user?.last_name}
                              </div>
                              <div className="text-[9px] font-bold text-muted-foreground/40 truncate">{t.intern?.user?.email}</div>
                            </div>
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest border border-current/20 flex-shrink-0 ${ts.color} ${ts.bg}`}>
                              {t.status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        title="Delete Master Task"
        description="This will permanently delete the Master Task and ALL delegated intern assignments across every department. This cannot be undone."
      />
    </div>
  );
}

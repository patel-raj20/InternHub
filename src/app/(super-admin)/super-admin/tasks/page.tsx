"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from "@/store";
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, Plus, Search, Building2,
  Calendar, CheckCircle2, Clock, AlertCircle,
  Trash2, ChevronRight
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { graphqlService } from "@/lib/services/graphql-service";
import { Department } from "@/lib/types";
import CreateDepartmentTaskModal from "@/components/dashboard/CreateDepartmentTaskModal";
import DeleteConfirmationModal from "@/components/dashboard/DeleteConfirmationModal";
import toast from "react-hot-toast";

interface MasterTask {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: string;
  created_at: string;
  isLegacy?: boolean;
  department_tasks: { 
    id: string; 
    department_id: string; 
    status: string;
    tasks?: { id: string; status: string }[];
  }[];
}

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  COMPLETED: { label: "Completed", color: "text-emerald-500", bg: "bg-emerald-500/10", icon: <CheckCircle2 size={10} /> },
  ASSIGNED:  { label: "Assigned",  color: "text-primary",     bg: "bg-primary/10",      icon: <Clock size={10} /> },
  PENDING:   { label: "Pending",   color: "text-amber-500",   bg: "bg-amber-500/10",    icon: <AlertCircle size={10} /> },
};

export default function SuperAdminTasksPage() {
  const { organization_id } = useSelector((state: RootState) => state.user);
  const router = useRouter();

  const [tasks, setTasks] = useState<MasterTask[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<{ id: string; isLegacy: boolean } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    if (!organization_id) return;
    setLoading(true);
    try {
      const [masterTasksData, legacyTasksRaw, deptsData] = await Promise.all([
        graphqlService.getMasterTasks(organization_id).catch(() => []),
        graphqlService.getDepartmentTasksForSuperAdmin(organization_id).catch(() => []),
        graphqlService.getDepartments(organization_id),
      ]);

      // Filter legacy tasks: those without master_task_id (old schema)
      const legacyOnly = (legacyTasksRaw as any[]).filter((t: any) => !t.master_task_id);

      // Deduplicate legacy tasks by title (one representative per unique task name)
      const legacyMap = new Map<string, MasterTask>();
      for (const lt of legacyOnly) {
        const key = lt.title?.toLowerCase().trim();
        if (!key) continue;
        if (!legacyMap.has(key)) {
          legacyMap.set(key, {
            id: lt.id,
            title: lt.title,
            description: lt.description || '',
            deadline: lt.deadline,
            status: lt.status || 'PENDING',
            created_at: lt.created_at,
            isLegacy: true,
            department_tasks: [],
          });
        }
        // Collect all department entries under the same title
        const entry = legacyMap.get(key)!;
        entry.department_tasks.push({ id: lt.id, department_id: lt.department_id, status: lt.status });
      }

      const combined = [...masterTasksData, ...Array.from(legacyMap.values())];
      setTasks(combined);
      setDepartments(deptsData);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load master tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [organization_id]);

  const filteredTasks = useMemo(() =>
    tasks.filter(t =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ), [tasks, searchQuery]);

  const deptMap = useMemo(() => {
    const m: Record<string, string> = {};
    departments.forEach(d => { m[d.id] = d.name; });
    return m;
  }, [departments]);

  const stats = useMemo(() => ({
    total: tasks.length,
    pending: tasks.filter(t => t.status?.toLowerCase() === 'pending').length,
    assigned: tasks.filter(t => t.status?.toLowerCase() === 'assigned').length,
    completed: tasks.filter(t => t.status?.toLowerCase() === 'completed').length,
  }), [tasks]);

  const handleOpenDetail = (task: MasterTask) => {
    if (task.isLegacy) {
      toast("Legacy task — no detailed view. Create new tasks using the new format.", { icon: '🗂️' });
      return;
    }
    router.push(`/super-admin/tasks/${task.id}`);
  };

  const handleOpenDelete = (e: React.MouseEvent, task: MasterTask) => {
    e.stopPropagation();
    setTaskToDelete({ id: task.id, isLegacy: task.isLegacy ?? false });
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      if (taskToDelete.isLegacy) {
        // Delete all legacy department_tasks with this representative id
        // Find all dept_task ids grouped under this legacy task
        const legacyTask = tasks.find(t => t.id === taskToDelete.id && t.isLegacy);
        if (legacyTask) {
          await Promise.all(
            legacyTask.department_tasks.map(dt => graphqlService.deleteDepartmentTask(dt.id))
          );
        }
      } else {
        await graphqlService.deleteMasterTask(taskToDelete.id);
      }
      toast.success("Task and all assignments deleted");
      setIsDeleteOpen(false);
      setTaskToDelete(null);
      fetchData();
    } catch {
      toast.error("Failed to delete task");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* PAGE HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--primary)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">Tier 1 Command</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-none uppercase">
            Master <span className="text-primary italic">Tasks</span>
          </h1>
          <p className="text-muted-foreground font-medium text-sm max-w-xl leading-relaxed">
            One task definition. Multiple department assignments. Full cross-department telemetry.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Stats */}
          <div className="hidden md:grid grid-cols-3 gap-3">
            {[
              { label: "Total", value: stats.total, color: "text-foreground" },
              { label: "Pending", value: stats.pending, color: "text-amber-500" },
              { label: "Done", value: stats.completed, color: "text-emerald-500" },
            ].map(s => (
              <div key={s.label} className="text-center bg-muted/20 border border-border/30 rounded-2xl px-4 py-3">
                <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">{s.label}</div>
              </div>
            ))}
          </div>

          <Button
            onClick={() => setIsCreateOpen(true)}
            className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
          >
            <Plus size={18} strokeWidth={3} />
            New Master Task
          </Button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/50" />
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search master tasks..."
          className="w-full bg-muted/20 border border-border/30 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/30 backdrop-blur-sm"
        />
      </div>

      {/* TASK LIST */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Loading Architecture...</span>
        </div>
      ) : filteredTasks.length === 0 ? (
        <Card className="border-dashed border-2 border-border/30 bg-muted/5 py-24 text-center">
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-muted/30 flex items-center justify-center text-muted-foreground/30 border border-border/30">
              <ClipboardList size={32} />
            </div>
            <h3 className="text-xl font-black tracking-tight uppercase">No Master Tasks</h3>
            <p className="text-xs font-bold text-muted-foreground/40 max-w-xs">
              Create your first strategic master task to assign to departments across your organization.
            </p>
            <Button onClick={() => setIsCreateOpen(true)} className="mt-2 rounded-xl font-black uppercase tracking-widest text-[11px]">
              <Plus size={14} className="mr-2" /> Create First Task
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredTasks.map((task, i) => {
              const sc = STATUS_CFG[task.status] || STATUS_CFG['PENDING'];
              const allInternTasks = task.department_tasks?.flatMap((dt: any) => dt.tasks || []) || [];
              const completed = allInternTasks.filter((t: any) => t?.status?.toLowerCase() === 'completed').length;
              const pct = allInternTasks.length > 0 ? Math.round((completed / allInternTasks.length) * 100) : 0;
              const isAllDone = completed === allInternTasks.length && allInternTasks.length > 0;

              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card
                    className="border-border/40 hover:border-primary/40 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,122,255,0.07)] cursor-pointer group overflow-hidden"
                    onClick={() => handleOpenDetail(task)}
                  >
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        {/* Main Info */}
                        <div className="flex-1 p-6 space-y-4">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className={`flex items-center gap-1.5 text-[9px] font-black px-2.5 py-1 rounded-lg border border-current/20 uppercase tracking-widest ${sc.color} ${sc.bg}`}>
                              {sc.icon} {sc.label}
                            </span>
                            {task.isLegacy && (
                              <span className="text-[9px] font-black px-2.5 py-1 rounded-lg bg-muted/40 text-muted-foreground/50 border border-border/30 uppercase tracking-widest">
                                Legacy
                              </span>
                            )}
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 flex items-center gap-1.5">
                              <Building2 size={10} /> {task.department_tasks.length} Department{task.department_tasks.length !== 1 ? 's' : ''}
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 flex items-center gap-1.5">
                              <Calendar size={10} /> {task.deadline ? new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'No deadline'}
                            </span>
                          </div>

                          <div>
                            <CardTitle className="text-xl font-black tracking-tight uppercase group-hover:text-primary transition-colors">
                              {task.title}
                            </CardTitle>
                            <CardDescription className="text-xs font-medium mt-1 line-clamp-2">
                              {task.description}
                            </CardDescription>
                          </div>

                          {/* Department Badges */}
                          <div className="flex flex-wrap gap-2">
                            {task.department_tasks.slice(0, 5).map(dt => {
                              const dTotal = dt.tasks?.length || 0;
                              const dCompleted = dt.tasks?.filter(t => t.status?.toLowerCase() === 'completed').length || 0;
                              const isDeptCompleted = dTotal > 0 && dCompleted === dTotal;
                              const ds = isDeptCompleted ? STATUS_CFG['COMPLETED'] : (STATUS_CFG[dt.status] || STATUS_CFG['PENDING']);
                              return (
                                <span key={dt.id} className={`flex items-center gap-1 text-[9px] font-black px-2.5 py-1 rounded-full ${ds.bg} ${ds.color} border border-current/20 transition-colors duration-300`}>
                                  {deptMap[dt.department_id] || 'Dept'} · {isDeptCompleted ? 'Completed' : ds.label}
                                </span>
                              );
                            })}
                            {task.department_tasks.length > 5 && (
                              <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-muted/40 text-muted-foreground/50 border border-border/30">
                                +{task.department_tasks.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Right Panel */}
                        <div className="md:w-52 p-6 border-t md:border-t-0 md:border-l border-border/30 bg-muted/10 flex flex-col items-center justify-center gap-4">
                          {/* Progress Ring */}
                          <div className="relative w-16 h-16">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                              <circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/30" />
                              <circle
                                cx="32" cy="32" r="26" fill="none" strokeWidth="6"
                                stroke={isAllDone ? "#10b981" : "var(--primary)"} strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 26}`}
                                strokeDashoffset={`${2 * Math.PI * 26 * (1 - pct / 100)}`}
                                style={{ transition: "stroke-dashoffset 1s ease" }}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-[11px] font-black">{pct}%</span>
                            </div>
                          </div>
                          <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 text-center">Completion</div>

                          <div className="flex items-center gap-2 w-full">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-xl hover:bg-destructive/10 text-muted-foreground/30 hover:text-destructive transition-colors flex-shrink-0"
                              onClick={(e) => handleOpenDelete(e, task)}
                              title="Delete Task"
                            >
                              <Trash2 size={15} />
                            </Button>
                            <Button
                              className="flex-1 h-10 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1 justify-center"
                              onClick={(e) => { e.stopPropagation(); handleOpenDetail(task); }}
                            >
                              {task.isLegacy ? 'Legacy Task' : 'View Details'} <ChevronRight size={13} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* MODALS */}
      <CreateDepartmentTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        departments={departments}
        organizationId={organization_id || ''}
        onSuccess={fetchData}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        title="Delete Master Task"
        description="This will permanently delete the Master Task and ALL delegated intern assignments across every department. This cannot be undone."
      />
    </div>
  );
}

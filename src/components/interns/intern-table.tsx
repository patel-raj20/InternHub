"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, ClipboardPlus, CheckSquare, Square, Users } from "lucide-react";
import { Intern } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { AssignTaskModal } from "@/components/interns/AssignTaskModal";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface InternTableProps {
  data: Intern[];
  isLoading?: boolean;
  mode: "ADMIN" | "SUPER_ADMIN";
  variant?: "management" | "report";
  onDelete?: (id: string) => void;
}

export function InternTable({ data, isLoading, mode, variant = "management", onDelete }: InternTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [assignTaskTarget, setAssignTaskTarget] = useState<string[] | null>(null);

  const toggleSelectAll = () => {
    if (selectedIds.length === data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.map(i => i.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border/50 overflow-hidden bg-card/30 backdrop-blur-md">
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (data.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground font-black uppercase tracking-widest text-[10px]">
        No interns found
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table className="min-w-[1000px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent border-primary/10">
            {variant === "management" ? (
              <>
                <TableHead className="w-12">
                   <button 
                    onClick={toggleSelectAll}
                    className="p-1 rounded-md hover:bg-primary/10 text-primary transition-colors"
                   >
                     {selectedIds.length === data.length && data.length > 0 ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                   </button>
                </TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px]">ID</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px]">Name</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px]">College</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px]">Status</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px]">Joining Date</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px]">End Date</TableHead>
                <TableHead className="text-right font-black uppercase tracking-widest text-[10px]">Actions</TableHead>
              </>
            ) : (
              <>
                <TableHead className="font-black uppercase tracking-widest text-[10px]">Enrollment Number</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px]">Account Credentials</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px]">College Name</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px]">Department</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px]">Status</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px]">Joining Date</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px]">End Date</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px]">Performance</TableHead>
                <TableHead className="text-right font-black uppercase tracking-widest text-[10px]">Actions</TableHead>
              </>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((intern) => (
            <TableRow 
              key={intern.id} 
              className={cn(
                "hover:bg-muted/30 transition-colors group",
                selectedIds.includes(intern.id) && "bg-primary/5 hover:bg-primary/10"
              )}
            >
              {variant === "management" ? (
                <>
                  <TableCell>
                    <button 
                      onClick={() => toggleSelect(intern.id)}
                      className={cn(
                        "p-1 rounded-md transition-colors",
                        selectedIds.includes(intern.id) ? "text-primary" : "text-muted-foreground/30 hover:text-primary/50"
                      )}
                    >
                      {selectedIds.includes(intern.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    </button>
                  </TableCell>
                  <TableCell className="font-black tracking-tighter text-muted-foreground/60">#{intern.id.slice(0, 8)}</TableCell>
                  <TableCell className="font-bold">
                    <div>
                      <div className="font-bold">{`${intern.user.first_name} ${intern.user.last_name || ""}`}</div>
                      <div className="text-[10px] text-muted-foreground font-medium">{intern.user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs font-medium">{intern.college_name || "N/A"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        intern.user.status === "ACTIVE"
                          ? "active"
                          : "dropped"
                      }
                    >
                      {intern.user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-bold">{new Date(intern.joining_date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-xs font-bold text-muted-foreground">{intern.end_date ? new Date(intern.end_date).toLocaleDateString() : "Present"}</TableCell>
                                    <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`${mode === 'SUPER_ADMIN' ? '/super-admin' : '/admin'}/interns/${intern.id}`}>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-primary/10 hover:bg-primary/5">
                          <Eye className="w-4 h-4 text-primary/60" />
                        </Button>
                      </Link>

                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 w-8 p-0 border-orange-500/10 hover:bg-orange-500/5 group/btn"
                        onClick={() => setAssignTaskTarget([intern.id])}
                      >
                        <ClipboardPlus className="w-4 h-4 text-orange-500/60 group-hover/btn:text-orange-500 transition-colors" />
                      </Button>
                      {mode === "SUPER_ADMIN" && (
                        <>
                          <Link href={`/super-admin/interns/${intern.id}/edit`}>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                            onClick={() => onDelete?.(intern.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell className="font-mono text-[10px] font-bold">
                    {intern.enrollment_number || intern.id.slice(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <div className="font-bold text-sm tracking-tight">{`${intern.user.first_name} ${intern.user.last_name || ""}`}</div>
                      <div className="text-[10px] text-muted-foreground font-bold">{intern.user.email}</div>
                      <div className="text-[10px] text-muted-foreground/60">{intern.user.phone || "No phone"}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-muted-foreground">{intern.college_name || "N/A"}</TableCell>
                  <TableCell>
                     <Badge variant="default" className="text-[9px] font-black uppercase tracking-widest opacity-70">{intern.user.department?.name || "N/A"}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        intern.user.status === "ACTIVE"
                          ? "active"
                          : "dropped"
                      }
                      className="text-[9px]"
                    >
                      {intern.user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[10px] font-black">{new Date(intern.joining_date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-[10px] font-black text-muted-foreground">
                    {intern.end_date ? new Date(intern.end_date).toLocaleDateString() : "Present"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <div className="p-1 rounded-md bg-orange-500/10 border border-orange-500/20">
                          <CheckCircle2 size={10} className="text-orange-500" />
                        </div>
                        <span className="text-[11px] font-black tracking-tight">{intern.total_points || 0} pts</span>
                      </div>
                      <div className="flex items-center gap-1.5 opacity-60">
                        <TrendingUp size={10} className="text-primary" />
                        <span className="text-[9px] font-bold uppercase tracking-tighter">Streak: {intern.streak || 0}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`${mode === 'SUPER_ADMIN' ? '/super-admin' : '/admin'}/interns/${intern.id}`}>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-primary/10 hover:bg-primary/5">
                          <Eye className="w-4 h-4 text-primary/60" />
                        </Button>
                      </Link>

                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 w-8 p-0 border-orange-500/10 hover:bg-orange-500/5 group/btn"
                        onClick={() => setAssignTaskTarget([intern.id])}
                      >
                        <ClipboardPlus className="w-4 h-4 text-orange-500/60 group-hover/btn:text-orange-500 transition-colors" />
                      </Button>
                      {mode === "SUPER_ADMIN" && (
                        <>
                          <Link href={`/super-admin/interns/${intern.id}/edit`}>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                            onClick={() => onDelete?.(intern.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
          >
            <div className="flex items-center gap-6 px-6 py-4 rounded-[2rem] bg-foreground text-background shadow-2xl border border-white/10 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest">{selectedIds.length} Selected</p>
                  <p className="text-[10px] opacity-60 font-bold">Bulk actions available</p>
                </div>
              </div>
              
              <div className="h-10 w-[1px] bg-white/10" />
              
              <Button 
                onClick={() => setAssignTaskTarget(selectedIds)}
                className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black uppercase text-[10px] tracking-widest px-6 h-11 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-orange-500/20"
              >
                <ClipboardPlus className="w-4 h-4 mr-2" />
                Assign Bulk Task
              </Button>

              <button 
                onClick={() => setSelectedIds([])}
                className="text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity px-2"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AssignTaskModal 
        isOpen={!!assignTaskTarget}
        onClose={() => setAssignTaskTarget(null)}
        internIds={assignTaskTarget || []}
        onSuccess={() => setSelectedIds([])}
      />
    </div>
  );
}

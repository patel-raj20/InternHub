"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ClipboardList, Calendar, Users, CheckCircle2, AlertCircle, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Department } from "@/lib/types";
import { graphqlService } from "@/lib/services/graphql-service";
import toast from "react-hot-toast";
import { useSelector } from 'react-redux';
import { RootState } from "@/store";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  departments: Department[];
  organizationId: string;
  onSuccess: () => void;
}

export default function CreateDepartmentTaskModal({ isOpen, onClose, departments, organizationId, onSuccess }: Props) {
  const { id: userId } = useSelector((state: RootState) => state.user);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
  });
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleDept = (id: string) => {
    setSelectedDepts((prev: string[]) => 
      prev.includes(id) ? prev.filter((d: string) => d !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDepts.length === 0) {
      toast.error("Please select at least one department");
      return;
    }
    if (!userId) {
      toast.error("Session error. Please refresh.");
      return;
    }

    setIsSubmitting(true);
    try {
      await graphqlService.createMasterTask({
        organization_id: organizationId,
        title: formData.title,
        description: formData.description,
        deadline: formData.deadline,
        created_by: userId,
        department_ids: selectedDepts,
      });
      toast.success(`Master task assigned to ${selectedDepts.length} department(s)!`);
      setFormData({ title: '', description: '', deadline: '' });
      setSelectedDepts([]);
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create master task");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl"
        >
          <Card className="border-border/50 shadow-2xl glass-card overflow-hidden">
            <CardHeader className="relative border-b border-border/10 bg-primary/5 pb-8">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4 rounded-full"
                onClick={onClose}
              >
                <X size={18} />
              </Button>
              <div className="flex flex-col items-center text-center space-y-2 mt-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 mb-2">
                  <ClipboardList className="text-primary" size={24} />
                </div>
                <CardTitle className="text-2xl font-black tracking-tight uppercase">Master Assignment</CardTitle>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">
                   Assign strategic goals to multiple departments simultaneously
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <form onSubmit={handleSubmit} className="divide-y divide-border/10">
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column: Basic Info */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2">
                        <CheckCircle2 size={12} className="text-primary" /> Task Title
                      </label>
                      <input
                        required
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Organization-wide Audit..."
                        className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all font-bold"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2">
                        <ClipboardList size={12} className="text-primary" /> Core Instructions
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all font-bold resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2">
                        <Calendar size={12} className="text-primary" /> Final Deadline
                      </label>
                      <input
                        required
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all font-bold"
                      />
                    </div>
                  </div>

                  {/* Right Column: Multi-Dept Selection */}
                  <div className="space-y-4">
                     <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2">
                          <Users size={12} className="text-primary" /> Target Departments
                        </label>
                        <span className="text-[9px] font-black text-primary uppercase">{selectedDepts.length} Selected</span>
                     </div>

                     <div className="max-h-[320px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                        {departments.map(dept => (
                           <div 
                             key={dept.id}
                             onClick={() => toggleDept(dept.id)}
                             className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                               selectedDepts.includes(dept.id) 
                               ? "bg-primary/10 border-primary shadow-sm" 
                               : "bg-muted/10 border-border/50 hover:border-primary/30"
                             }`}
                           >
                              <div className="flex items-center gap-3">
                                 <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] ${
                                   selectedDepts.includes(dept.id) ? "bg-primary text-white" : "bg-muted text-muted-foreground/40"
                                 }`}>
                                    {dept.name[0]}
                                 </div>
                                 <span className="text-[11px] font-black tracking-tight">{dept.name}</span>
                              </div>
                              {selectedDepts.includes(dept.id) && (
                                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                   <Check size={12} className="text-white" />
                                </div>
                              )}
                           </div>
                        ))}
                     </div>
                  </div>
                </div>

                <div className="p-8 bg-muted/5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-[11px] font-black uppercase tracking-widest"
                      onClick={onClose}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || selectedDepts.length === 0}
                      className="h-12 px-10 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 flex-1 md:flex-none"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                      ) : (
                        `Assign Task to ${selectedDepts.length || ''} Depts`
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

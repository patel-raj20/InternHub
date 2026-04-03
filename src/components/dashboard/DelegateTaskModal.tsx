"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Search, UserCheck, Send, ClipboardList, Info } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Intern, DepartmentTask } from "@/lib/types";
import { graphqlService } from "@/lib/services/graphql-service";
import toast from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  task: DepartmentTask | null;
  interns: Intern[];
  onSuccess: () => void;
}

export default function DelegateTaskModal({ isOpen, onClose, task, interns, onSuccess }: Props) {
  const [selectedInterns, setSelectedInterns] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedInterns([]);
      setSearchQuery("");
    }
  }, [isOpen]);

  const filteredInterns = interns.filter(intern => 
    `${intern.user?.first_name} ${intern.user?.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    intern.user?.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleIntern = (id: string) => {
    setSelectedInterns(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDelegate = async () => {
    if (!task) return;
    if (selectedInterns.length === 0) {
      toast.error("Please select at least one intern");
      return;
    }

    setIsSubmitting(true);
    try {
      const taskObjects = selectedInterns.map(intern_id => ({
        intern_id,
        parent_dept_task_id: task.id,
        title: task.title,
        description: task.description,
        deadline: task.deadline,
        status: 'pending',
        category: 'Departmental',
        difficulty: 'Medium',
        points_reward: 50
      }));

      await graphqlService.batchInsertTasks(taskObjects);
      
      // Update parent task status to ASSIGNED
      await graphqlService.updateDepartmentTaskStatus(task.id, 'ASSIGNED');
      
      toast.success(`Task delegated to ${selectedInterns.length} interns!`);
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delegate tasks");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !task) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
        <motion.div
           initial={{ opacity: 0, scale: 0.9, y: 20 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           exit={{ opacity: 0, scale: 0.9, y: 20 }}
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
               
               <div className="flex flex-col items-center text-center space-y-2 mt-4 px-6">
                 <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 mb-2">
                   <Send className="text-primary" size={24} />
                 </div>
                 <CardTitle className="text-2xl font-black tracking-tight uppercase">Delegate to Interns</CardTitle>
                 <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">
                    Tier 2: Assigning "{task.title}" to your team
                 </p>
               </div>
             </CardHeader>

             <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2">
                   
                   {/* Left: Selection */}
                   <div className="p-6 border-r border-border/10 space-y-6 bg-muted/5">
                      <div className="relative">
                         <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                         <input 
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           placeholder="Filter interns..."
                           className="w-full bg-background border border-border/50 rounded-xl py-2 pl-9 pr-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                         />
                      </div>

                      <div className="max-h-[350px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                         {filteredInterns.map(intern => (
                           <div 
                             key={intern.id}
                             onClick={() => toggleIntern(intern.id)}
                             className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                               selectedInterns.includes(intern.id) 
                               ? "bg-primary/10 border-primary shadow-sm" 
                               : "bg-background border-border/50 hover:border-primary/30"
                             }`}
                           >
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] ${
                                selectedInterns.includes(intern.id) ? "bg-primary text-white" : "bg-muted text-muted-foreground/60"
                              }`}>
                                {intern.user?.first_name[0]}{intern.user?.last_name?.[0] || ""}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <div className="text-[11px] font-black tracking-tight truncate">{intern.user?.first_name} {intern.user?.last_name}</div>
                                 <div className="text-[9px] text-muted-foreground/60 font-medium truncate">{intern.user?.email}</div>
                              </div>
                              {selectedInterns.includes(intern.id) && (
                                <UserCheck size={14} className="text-primary" />
                              )}
                           </div>
                         ))}
                      </div>
                   </div>

                   {/* Right: Summary & Action */}
                   <div className="p-8 flex flex-col justify-between bg-primary/[0.02]">
                      <div className="space-y-6">
                        <div className="p-4 bg-background border border-border/50 rounded-2xl space-y-2">
                           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                             <ClipboardList size={12} /> Master Task Details
                           </div>
                           <h4 className="text-sm font-black tracking-tighter uppercase leading-none">{task.title}</h4>
                           <p className="text-[10px] text-muted-foreground/70 font-medium leading-relaxed italic line-clamp-3">
                              {task.description}
                           </p>
                        </div>

                        <div className="space-y-4">
                           <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Recipients</span>
                              <span className="text-xs font-black text-primary">{selectedInterns.length} Selected</span>
                           </div>
                           
                           <AnimatePresence>
                             {selectedInterns.length > 0 && (
                               <motion.div 
                                 initial={{ opacity: 0, height: 0 }}
                                 animate={{ opacity: 1, height: 'auto' }}
                                 exit={{ opacity: 0, height: 0 }}
                                 className="flex flex-wrap gap-1"
                               >
                                  {selectedInterns.slice(0, 4).map(id => {
                                    const intern = interns.find(i => i.id === id);
                                    return (
                                      <div key={id} className="text-[9px] font-black uppercase px-2 py-1 rounded bg-primary/20 text-primary border border-primary/20">
                                        {intern?.user?.first_name}
                                      </div>
                                    );
                                  })}
                                  {selectedInterns.length > 4 && (
                                    <div className="text-[9px] font-black uppercase px-2 py-1 rounded bg-muted/50 text-muted-foreground/60">
                                      + {selectedInterns.length - 4} More
                                    </div>
                                  )}
                               </motion.div>
                             )}
                           </AnimatePresence>
                        </div>

                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex gap-3">
                           <Info size={14} className="text-amber-500 mt-0.5 shrink-0" />
                           <p className="text-[9px] font-medium text-amber-500/80 leading-relaxed uppercase tracking-tighter">
                             Heads up: Delegation creates distinct tracking nodes for each intern. Changes to the master task will not automatically propagate once delegated.
                           </p>
                        </div>
                      </div>

                      <div className="pt-8 space-y-3">
                         <Button
                           onClick={handleDelegate}
                           disabled={isSubmitting || selectedInterns.length === 0}
                           className="w-full h-12 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 group"
                         >
                           {isSubmitting ? (
                             <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                           ) : (
                             <>Launch Delegation <Send size={14} className="ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
                           )}
                         </Button>
                         <Button
                           variant="ghost"
                           onClick={onClose}
                           className="w-full h-12 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-transparent hover:text-muted-foreground"
                         >
                           Maybe Later
                         </Button>
                      </div>
                   </div>

                </div>
             </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

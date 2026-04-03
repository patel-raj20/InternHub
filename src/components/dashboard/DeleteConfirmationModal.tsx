"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isDeleting?: boolean;
}

export default function DeleteConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description,
  isDeleting = false
}: Props) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/60 backdrop-blur-xl">
        <motion.div
           initial={{ opacity: 0, scale: 0.95, y: 10 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           exit={{ opacity: 0, scale: 0.95, y: 10 }}
           className="w-full max-w-md"
        >
          <Card className="border-destructive/20 shadow-2xl glass-card overflow-hidden">
             <CardHeader className="relative pb-4 flex flex-col items-center text-center space-y-4 pt-10">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-4 rounded-full"
                  onClick={onClose}
                  disabled={isDeleting}
                >
                  <X size={18} />
                </Button>

                <div className="w-16 h-16 rounded-3xl bg-destructive/10 flex items-center justify-center text-destructive border border-destructive/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                   <AlertTriangle size={32} />
                </div>

                <div className="space-y-2 px-6">
                   <CardTitle className="text-2xl font-black tracking-tight uppercase">Confirm Purge</CardTitle>
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-destructive/80 italic">Unrecoverable Operation</p>
                </div>
             </CardHeader>

             <CardContent className="px-10 pb-10 space-y-8">
                <div className="text-center space-y-4">
                   <h4 className="text-sm font-black tracking-tight uppercase text-foreground/90">{title}</h4>
                   <p className="text-xs font-bold text-muted-foreground/60 leading-relaxed uppercase tracking-tighter">
                      {description}
                   </p>
                </div>

                <div className="flex flex-col gap-3">
                   <Button
                     onClick={onConfirm}
                     disabled={isDeleting}
                     className="w-full h-14 rounded-2xl bg-destructive text-destructive-foreground hover:bg-destructive/90 font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-destructive/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                   >
                     {isDeleting ? (
                       <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                          Purging Architecture...
                       </div>
                     ) : (
                       <div className="flex items-center gap-2">
                          <Trash2 size={16} />
                          Finalize Deletion
                       </div>
                     )}
                   </Button>
                   <Button
                     variant="ghost"
                     onClick={onClose}
                     disabled={isDeleting}
                     className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                   >
                     Abort Operation
                   </Button>
                </div>
             </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

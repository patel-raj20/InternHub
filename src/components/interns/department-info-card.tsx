"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Info } from "lucide-react";
import { motion } from "framer-motion";

interface DepartmentInfoCardProps {
  name: string;
  totalInterns: number;
}

export function DepartmentInfoCard({ name, totalInterns }: DepartmentInfoCardProps) {
  return (
    <Card className="h-full border-border/50 glass-card group overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 flex items-center gap-2">
            <Building2 className="w-3 h-3 text-primary neon-glow" />
            Department Profile
          </CardTitle>
          <div className="p-1.5 bg-primary/5 rounded-lg text-primary/40 group-hover:text-primary transition-colors">
            <Info size={14} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 mt-4">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">Department Name</p>
          <p className="text-2xl font-black tracking-tighter leading-none">{name}</p>
        </div>
        
        <div className="pt-6 border-t border-border/50">
          <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest mb-2">Resource Allocation</p>
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-black tracking-tighter text-primary neon-glow">{totalInterns}</span>
            <div className="space-y-0.5">
              <p className="text-sm font-black tracking-tight leading-none uppercase text-foreground/80">Active Interns</p>
              <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Assigned to {name}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
            <span>Utilization</span>
            <span>{Math.min(100, totalInterns * 5)}%</span>
          </div>
          <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden border border-border/20">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, totalInterns * 5)}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-primary neon-glow rounded-full"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

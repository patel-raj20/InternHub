"use client";

import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earned_at?: string;
}

interface BadgeGridProps {
  badges: Badge[];
}

export function BadgeGrid({ badges }: BadgeGridProps) {
  if (!badges || badges.length === 0) {
    return (
      <div className="rounded-3xl p-12 glass-card border border-border/50 border-dashed flex flex-col items-center justify-center text-center">
         <div className="p-4 rounded-full bg-muted/20 text-muted-foreground mb-4">
            <LucideIcons.ShieldAlert className="h-8 w-8 opacity-20" />
         </div>
         <h4 className="text-lg font-bold text-muted-foreground/60">No badges earned yet</h4>
         <p className="text-sm text-muted-foreground/40 mt-1 max-w-[200px]">
           Start your streak journey and earn legendary badges! 🚀
         </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {badges.map((badge, index) => {
        const IconComponent = (LucideIcons as any)[badge.icon.charAt(0).toUpperCase() + badge.icon.slice(1)] 
          || (LucideIcons as any)[badge.icon.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('')]
          || LucideIcons.Award;

        return (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, type: "spring" }}
            whileHover={{ y: -5, scale: 1.05 }}
            className="group relative"
          >
            <div className="flex flex-col items-center">
              <div className="relative h-24 w-24 flex items-center justify-center">
                 {/* Hexagon Background */}
                 <div className="absolute inset-0 bg-primary/10 rotate-45 rounded-2xl transition-transform duration-500 group-hover:rotate-90 group-hover:bg-primary/20" />
                 <div className="absolute inset-0 bg-primary/5 -rotate-12 rounded-3xl transition-transform duration-700 group-hover:-rotate-45" />
                 
                 <div className="relative p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/30 border border-primary/20 shadow-lg transition-all group-hover:shadow-primary/20 group-hover:shadow-xl">
                    <IconComponent className="h-8 w-8 text-primary fill-primary/10 drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                 </div>
              </div>
              
              <div className="mt-4 text-center">
                 <h5 className="text-xs font-black tracking-tight text-foreground uppercase group-hover:text-primary transition-colors">
                   {badge.name}
                 </h5>
                 <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1 font-medium">
                   {new Date(badge.earned_at || "").toLocaleDateString()}
                 </p>
              </div>

              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-3 py-2 rounded-xl bg-popover text-popover-foreground text-[10px] font-bold shadow-2xl border border-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                 {badge.description}
                 <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-popover" />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

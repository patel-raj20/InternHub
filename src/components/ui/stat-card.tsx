"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  color?: string;
  className?: string;
}

export function StatCard({ title, value, description, icon, color = "var(--primary)", className }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Card className={cn("overflow-hidden border-border/40 group relative rounded-[2rem] bg-background/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-500", className)}>
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 -mr-12 -mt-12 rounded-full blur-3xl opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity" style={{ backgroundColor: color }} />
        
        <CardContent className="p-8 relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 leading-none">
                {title}
              </span>
              <h3 className="text-4xl font-black tracking-tighter mt-2">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </h3>
            </div>
            
            {icon && (
              <div 
                className="p-3.5 rounded-[1.25rem] transition-all duration-500 group-hover:scale-110 shadow-sm"
                style={{ 
                  backgroundColor: `${color}15`, 
                  border: `1.5px solid ${color}25`,
                  color: color
                }}
              >
                {icon}
              </div>
            )}
          </div>

          <div className="flex items-end justify-between">
            {/* Legend / Sparkline placeholder removed for clean UI */}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

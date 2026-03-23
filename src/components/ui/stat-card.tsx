"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  className?: string;
}

export function StatCard({ title, value, description, icon, trend, className }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Card className={cn("overflow-hidden border-border/50 group relative", className)}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">
            {title}
          </CardTitle>
          {icon && (
            <div className="p-2 bg-primary/10 rounded-xl text-primary neon-glow group-hover:scale-110 transition-transform duration-300">
              {icon}
            </div>
          )}
        </CardHeader>
        
        <CardContent className="relative z-10">
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <div className="text-3xl font-black tracking-tighter">{value}</div>
              {description && <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest leading-none">{description}</p>}
            </div>
            
            {/* Mini Sparkline SVG */}
            <div className="h-10 w-20 opacity-40 group-hover:opacity-100 transition-opacity duration-500">
              <svg viewBox="0 0 100 40" className="h-full w-full overflow-visible">
                <path
                  d={trend?.isPositive 
                    ? "M0,35 Q20,30 40,20 T80,10 T100,5" 
                    : "M0,5 Q20,10 40,20 T80,30 T100,35"}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className={trend?.isPositive ? "text-green-500" : "text-red-500"}
                />
              </svg>
            </div>
          </div>

          {trend && (
            <div className="flex items-center mt-4 space-x-2">
              <span
                className={cn(
                  "text-[10px] font-black px-2 py-0.5 rounded-lg border flex items-center gap-1",
                  trend.isPositive 
                    ? "bg-green-500/10 text-green-500 border-green-500/20" 
                    : "bg-red-500/10 text-red-500 border-red-500/20"
                )}
              >
                {trend.isPositive ? "↑" : "↓"} {trend.value}%
              </span>
              <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">{trend.label}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

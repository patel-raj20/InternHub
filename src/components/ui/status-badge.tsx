import * as React from "react";
import { cn } from "@/lib/utils";
import { UserStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: UserStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants = {
    ACTIVE: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 neon-glow",
    COMPLETED: "bg-primary/10 text-primary border-primary/20",
    PENDING: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    INACTIVE: "bg-slate-500/10 text-slate-500 border-slate-500/20 opacity-60",
  };

  const labels = {
    ACTIVE: "Active",
    COMPLETED: "Completed",
    PENDING: "Pending",
    INACTIVE: "Terminated",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider transition-all duration-300",
        variants[status] || variants.PENDING,
        className
      )}
    >
      <span className="relative flex h-1.5 w-1.5 mr-2">
        <span className={cn(
          "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
          status === 'ACTIVE' ? 'bg-emerald-400' : 'hidden'
        )}></span>
        <span className={cn(
          "relative inline-flex rounded-full h-1.5 w-1.5",
          status === 'ACTIVE' ? 'bg-emerald-500' : 
          status === 'COMPLETED' ? 'bg-primary' :
          status === 'PENDING' ? 'bg-amber-500' : 'bg-slate-500'
        )}></span>
      </span>
      {labels[status] || status}
    </div>
  );
}

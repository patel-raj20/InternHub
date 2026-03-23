import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "active" | "completed" | "dropped" | "default";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-secondary/50 text-secondary-foreground backdrop-blur-sm border-border/50",
    active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 neon-glow",
    completed: "bg-primary/10 text-primary border-primary/20",
    dropped: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider transition-all duration-300",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };

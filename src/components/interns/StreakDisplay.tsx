"use client";

import { motion } from "framer-motion";
import { Flame, Trophy, Zap, Target, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  nextMilestoneDays?: number;
  daysToNext?: number;
  hasMarkedToday: boolean;
  streakAtRisk?: boolean;
}

export function StreakDisplay({
  currentStreak,
  longestStreak,
  totalPoints,
  nextMilestoneDays,
  daysToNext,
  hasMarkedToday,
  streakAtRisk
}: StreakDisplayProps) {
  const progress = nextMilestoneDays 
    ? (currentStreak / nextMilestoneDays) * 100 
    : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
    >
      {/* Current Streak Card */}
      <div className={cn(
        "relative overflow-hidden rounded-3xl p-6 glass-card border flex flex-col justify-between transition-all duration-500 hover:shadow-2xl hover:-translate-y-1",
        hasMarkedToday ? "border-orange-500/30" : "border-border/50"
      )}>
        <div className="flex items-center justify-between">
          <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500">
            <motion.div
              animate={{ 
                scale: hasMarkedToday ? [1, 1.2, 1] : 1,
                rotate: hasMarkedToday ? [0, 10, -10, 0] : 0
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            >
              <Flame className={cn("h-6 w-6", hasMarkedToday && "fill-orange-500")} />
            </motion.div>
          </div>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Daily Streak
          </span>
        </div>
        
        <div className="mt-8">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black tracking-tighter text-foreground">
              {currentStreak}
            </span>
            <span className="text-xl font-bold text-muted-foreground">Days</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
             Best: {longestStreak} days
          </p>
        </div>

        {streakAtRisk && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded-full"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">At Risk</span>
          </motion.div>
        )}
      </div>

      {/* Points & Progress Card */}
      <div className="rounded-3xl p-6 glass-card border border-border/50 flex flex-col transition-all duration-500 hover:shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
            <Zap className="h-6 w-6 fill-blue-500" />
          </div>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Points
          </span>
        </div>
        
        <div className="mt-8 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black tracking-tighter text-foreground">
              {totalPoints}
            </span>
            <span className="text-xl font-bold text-muted-foreground">PTS</span>
          </div>
          
          <div className="mt-6">
             <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-muted-foreground font-semibold">Next Milestone: {nextMilestoneDays} days</span>
                <span className="text-primary font-bold">{daysToNext} left</span>
             </div>
             <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-primary to-blue-500"
                />
             </div>
          </div>
        </div>
      </div>

      {/* Milestone Card */}
      <div className="rounded-3xl p-6 glass-card border border-border/50 flex flex-col justify-between transition-all duration-500 hover:shadow-2xl group">
        <div className="flex items-center justify-between">
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500">
             <Trophy className="h-6 w-6" />
          </div>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Goal
          </span>
        </div>
        
        <div className="mt-8">
           <p className="text-sm text-muted-foreground font-medium mb-1 line-clamp-1">
             Your streak is growing! 🚀
           </p>
           <h3 className="text-2xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors">
              Maintain Consistency
           </h3>
        </div>

        <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
           <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Target className="h-3 w-3" />
              <span>Target: Consistency</span>
           </div>
           <TrendingUp className="h-4 w-4 text-emerald-500" />
        </div>
      </div>

      {/* Attendance Status Card */}
      <div className="rounded-3xl p-6 glass-card border border-border/50 flex flex-col justify-between overflow-hidden relative transition-all duration-500 hover:shadow-2xl">
         {hasMarkedToday && (
            <div className="absolute -top-10 -right-10 h-32 w-32 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
         )}
         
         <div className="flex items-center justify-between">
            <div className={cn(
              "p-3 rounded-2xl",
              hasMarkedToday ? "bg-emerald-500/10 text-emerald-500" : "bg-muted/10 text-muted-foreground"
            )}>
              <Target className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Status
            </span>
          </div>

          <div className="mt-8">
             <h4 className={cn(
               "text-3xl font-black tracking-tight",
               hasMarkedToday ? "text-emerald-500" : "text-muted-foreground"
             )}>
                {hasMarkedToday ? "Marked Done" : "Not Marked"}
             </h4>
             <p className="text-sm text-muted-foreground mt-1 font-medium">
                {hasMarkedToday 
                  ? "Great job being on time! ✨" 
                  : "Don't forget to mark today! ⏰"}
             </p>
          </div>
      </div>
    </motion.div>
  );
}

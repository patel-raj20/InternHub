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
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.1 }
        }
      }}
      className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
    >
      {/* Current Streak Card */}
      <motion.div 
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 }
        }}
        className={cn(
        "relative group p-6 premium-glass glass-noise rounded-[2.5rem] transition-all duration-500 hover:shadow-2xl hover:-translate-y-1",
        hasMarkedToday ? "border-orange-500/40" : "border-border/50"
      )}>
        {/* Glow Blobs */}
        <div className="glow-blob -top-10 -left-10 bg-orange-500/20 group-hover:bg-orange-500/30 transition-colors" />
        <div className="glow-blob -bottom-10 -right-10 bg-orange-500/10" />

        <div className="relative z-10 flex flex-col h-full justify-between">
          <div className="flex items-center justify-between">
            <div className="p-3.5 rounded-2xl bg-orange-500/15 text-orange-500 border border-orange-500/20 shadow-lg shadow-orange-500/10">
              <motion.div
                animate={{ 
                  scale: hasMarkedToday ? [1, 1.15, 1] : 1,
                  rotate: hasMarkedToday ? [0, 5, -5, 0] : 0
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Flame className={cn("h-6 w-6", hasMarkedToday && "fill-orange-500")} />
              </motion.div>
            </div>
            <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">
              Daily Streak
            </span>
          </div>
          
          <div className="mt-8">
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-black tracking-tighter text-foreground drop-shadow-sm">
                {currentStreak}
              </span>
              <span className="text-xl font-black text-muted-foreground/50 lowercase">days</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mt-1">
               Personal Best: {longestStreak} days
            </p>
          </div>

          {streakAtRisk && (
            <motion.div 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute -top-1 -right-1 flex items-center gap-1.5 px-3 py-1 bg-red-500 text-white rounded-full shadow-lg shadow-red-500/40 z-20"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest">At Risk</span>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Points Card */}
      <motion.div 
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 }
        }}
        className="relative group p-6 premium-glass glass-noise rounded-[2.5rem] transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
      >
        <div className="glow-blob -top-10 -right-10 bg-primary/20 group-hover:bg-primary/30 transition-colors" />
        
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div className="flex items-center justify-between">
            <div className="p-3.5 rounded-2xl bg-primary/15 text-primary border border-primary/20 shadow-lg shadow-primary/10">
              <Zap className="h-6 w-6 fill-primary" />
            </div>
            <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">
              Earned Points
            </span>
          </div>
          
          <div className="mt-8">
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-black tracking-tighter text-foreground drop-shadow-sm">
                {totalPoints}
              </span>
              <span className="text-xl font-black text-muted-foreground/50 uppercase">pts</span>
            </div>
            
            <div className="mt-6 space-y-2">
               <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
                  <span className="text-muted-foreground/60">Next Milestone: {nextMilestoneDays} days</span>
                  <span className="text-primary">{daysToNext} left</span>
               </div>
               <div className="h-1.5 w-full bg-muted/20 rounded-full overflow-hidden p-0.5 border border-border/50">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full shadow-[0_0_10px_rgba(0,122,255,0.5)]"
                  />
               </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Milestone/Goal Card */}
      <motion.div 
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 }
        }}
        className="relative group p-6 premium-glass glass-noise rounded-[2.5rem] transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
      >
        <div className="glow-blob bottom-0 left-0 bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors" />
        
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div className="flex items-center justify-between">
            <div className="p-3.5 rounded-2xl bg-purple-500/15 text-purple-500 border border-purple-500/20 shadow-lg shadow-purple-500/10">
               <Trophy className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">
              Goal Progress
            </span>
          </div>
          
          <div className="mt-8">
             <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/40 mb-1">
               Current Focus 🚀
             </p>
             <h3 className="text-2xl font-black text-foreground tracking-tight leading-tight">
                Maintain Your Consistency
             </h3>
          </div>

          <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
             <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                <Target className="h-3 w-3" />
                <span>Standard Goal</span>
             </div>
             <TrendingUp className="h-4 w-4 text-emerald-500 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
          </div>
        </div>
      </motion.div>

      {/* Status Card */}
      <motion.div 
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 }
        }}
        className={cn(
        "relative group p-6 premium-glass glass-noise rounded-[2.5rem] transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 overflow-hidden",
        hasMarkedToday ? "border-emerald-500/40" : "border-border/50 shadow-inner"
      )}>
         <div className={cn(
           "glow-blob -bottom-10 -right-10 transition-colors",
           hasMarkedToday ? "bg-emerald-500/25" : "bg-muted/10"
         )} />
         
         <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center justify-between">
               <div className={cn(
                 "p-3.5 rounded-2xl border transition-colors",
                 hasMarkedToday 
                  ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/20 shadow-lg shadow-emerald-500/10" 
                  : "bg-muted/10 text-muted-foreground/40 border-border/50"
               )}>
                 <Target className="h-6 w-6" />
               </div>
               <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">
                 Daily Status
               </span>
            </div>

            <div className="mt-8">
               <h4 className={cn(
                 "text-4xl font-black tracking-tighter drop-shadow-sm",
                 hasMarkedToday ? "text-emerald-500" : "text-muted-foreground/40"
               )}>
                  {hasMarkedToday ? "Marked Done" : "Not Marked"}
               </h4>
               <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">
                  {hasMarkedToday 
                    ? "Great job being on time! ✨" 
                    : "Action required today! ⚠️"}
               </p>
            </div>
         </div>
      </motion.div>
    </motion.div>
  );
}

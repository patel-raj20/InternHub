"use client";

import { motion } from "framer-motion";
import { Flame, Trophy, Zap, CheckCircle2, TrendingUp, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskStreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  nextMilestoneDays?: number;
  daysToNext?: number;
  hasCompletedToday: boolean;
  streakAtRisk?: boolean;
}

export function TaskStreakDisplay({
  currentStreak,
  longestStreak,
  totalPoints,
  nextMilestoneDays,
  daysToNext,
  hasCompletedToday,
  streakAtRisk
}: TaskStreakDisplayProps) {
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
      {/* Task Streak Card */}
      <motion.div 
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 }
        }}
        className={cn(
        "relative group p-6 premium-glass glass-noise rounded-[2.5rem] transition-all duration-500 hover:shadow-2xl hover:-translate-y-1",
        hasCompletedToday ? "border-orange-500/40" : "border-border/50"
      )}>
        {/* Glow Blobs */}
        <div className="glow-blob -top-10 -left-10 bg-orange-500/20 group-hover:bg-orange-500/30 transition-colors" />
        <div className="glow-blob -bottom-10 -right-10 bg-orange-500/10" />

        <div className="relative z-10 flex flex-col h-full justify-between">
          <div className="flex items-center justify-between">
            <div className="p-3.5 rounded-2xl bg-orange-500/15 text-orange-500 border border-orange-500/20 shadow-lg shadow-orange-500/10">
              <motion.div
                animate={{ 
                  scale: hasCompletedToday ? [1, 1.15, 1] : 1,
                  rotate: hasCompletedToday ? [0, 5, -5, 0] : 0
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Flame className={cn("h-6 w-6", hasCompletedToday && "fill-orange-500")} />
              </motion.div>
            </div>
            <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">
              Productivity Streak
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

      {/* Gamification Points Card */}
      <motion.div 
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 }
        }}
        className="relative group p-6 premium-glass glass-noise rounded-[2.5rem] transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
      >
        <div className="glow-blob -top-10 -right-10 bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors" />
        
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div className="flex items-center justify-between">
            <div className="p-3.5 rounded-2xl bg-blue-500/15 text-blue-500 border border-blue-500/20 shadow-lg shadow-blue-500/10">
              <Zap className="h-6 w-6 fill-blue-500" />
            </div>
            <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">
              Total XP Points
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
                  <span className="text-muted-foreground/60">Next: {nextMilestoneDays}d Milestone</span>
                  <span className="text-blue-500">{daysToNext} tasks left</span>
               </div>
               <div className="h-1.5 w-full bg-muted/20 rounded-full overflow-hidden p-0.5 border border-border/50">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"
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
              Consistency Goal
            </span>
          </div>
          
          <div className="mt-8">
             <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/40 mb-1">
               {hasCompletedToday ? "Incredible work today! 🚀" : "Keep the momentum! ✨"}
             </p>
             <h3 className="text-2xl font-black text-foreground tracking-tight leading-tight">
                Consistency is Key to Success
             </h3>
          </div>

          <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
             <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                <span>Streak Bonus Active</span>
             </div>
             <Zap className="h-4 w-4 text-primary fill-primary drop-shadow-[0_0_5px_rgba(0,122,255,0.5)]" />
          </div>
        </div>
      </motion.div>

      {/* Task Status Card */}
      <motion.div 
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 }
        }}
        className={cn(
        "relative group p-6 premium-glass glass-noise rounded-[2.5rem] transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 overflow-hidden",
        hasCompletedToday ? "border-emerald-500/40" : "border-border/50 shadow-inner"
      )}>
         <div className={cn(
           "glow-blob -bottom-10 -right-10 transition-colors",
           hasCompletedToday ? "bg-emerald-500/25" : "bg-muted/10"
         )} />
         
         <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center justify-between">
               <div className={cn(
                 "p-3.5 rounded-2xl border transition-colors",
                 hasCompletedToday 
                  ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/20 shadow-lg shadow-emerald-500/10" 
                  : "bg-muted/10 text-muted-foreground/40 border-border/50"
               )}>
                 <CheckCircle2 className="h-6 w-6" />
               </div>
               <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">
                 Daily Checklist
               </span>
            </div>

            <div className="mt-8">
               <h4 className={cn(
                 "text-4xl font-black tracking-tighter drop-shadow-sm",
                 hasCompletedToday ? "text-emerald-500" : "text-muted-foreground/40"
               )}>
                  {hasCompletedToday ? "All Done" : "1 Pending"}
               </h4>
               <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">
                  {hasCompletedToday 
                    ? "Task completed! Great job! ✨" 
                    : "Complete 1 task to maintain streak! ⏰"}
               </p>
            </div>
         </div>
      </motion.div>
    </motion.div>
  );
}

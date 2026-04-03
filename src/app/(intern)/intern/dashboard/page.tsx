"use client";

import { useEffect, useState } from "react";
import { 
  Loader2, 
  Trophy,
  Flame,
  AlertCircle
} from "lucide-react";
import { graphqlService } from "@/lib/services/graphql-service";
import { WelcomeHeader } from "@/components/interns/welcome-header";
import { StreakDisplay } from "@/components/interns/StreakDisplay";
import { TaskStreakDisplay } from "@/components/interns/TaskStreakDisplay";
import { BadgeGrid } from "@/components/interns/BadgeGrid";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Intern } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function InternDashboardPage() {
  const { id: userId } = useSelector((state: RootState) => state.user);
  const [intern, setIntern] = useState<Intern | null>(null);
  const [streakStatus, setStreakStatus] = useState<any>(null);
  const [taskStreakStatus, setTaskStreakStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const [profileData, streakData, taskData] = await Promise.all([
        graphqlService.getInternByUserId(userId),
        fetch("/api/streak/status").then(res => res.json()),
        fetch("/api/streak/task-status").then(res => res.json())
      ]);
      
      setIntern(profileData);
      if (streakData.success) {
        setStreakStatus(streakData);
      }
      if (taskData.success) {
        setTaskStreakStatus(taskData);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!intern) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold font-black tracking-tight uppercase">Dashboard not available</h2>
        <p className="text-muted-foreground font-medium">We couldn't load your dashboard data.</p>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <WelcomeHeader name={`${intern.user.first_name} ${intern.user.last_name || ""}`} role="INTERN" />
        <Link href="/leaderboard">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 cursor-pointer"
          >
            <Trophy className="w-4 h-4" />
            View Leaderboard
          </motion.div>
        </Link>
      </div>

      <div className="space-y-8">
        {/* Attendance Streak Alert */}
        <AnimatePresence>
          {streakStatus?.streakAtRisk && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 animate-pulse"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-black uppercase tracking-tight">
                Your streak will break today! Mark your attendance now! 🔥
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-12">
          {/* DAILY ATTENDANCE STREAK */}
          {streakStatus && (
            <div className="space-y-6 animate-in">
               <div className="flex items-center gap-3">
                 <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500 shadow-sm border border-orange-500/10">
                    <Flame className="w-5 h-5" />
                 </div>
                 <div className="flex flex-col">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground/60 leading-none">Daily Attendance Streak</h3>
                    <div className="h-0.5 w-8 bg-orange-500/30 mt-1.5 rounded-full" />
                 </div>
               </div>
               <StreakDisplay 
                  currentStreak={streakStatus.currentStreak}
                  longestStreak={streakStatus.longestStreak}
                  totalPoints={streakStatus.totalPoints}
                  nextMilestoneDays={streakStatus.nextMilestone?.days}
                  daysToNext={streakStatus.daysToNext}
                  hasMarkedToday={streakStatus.hasMarkedToday}
                  streakAtRisk={streakStatus.streakAtRisk}
               />
            </div>
          )}

          {/* TASK PRODUCTIVITY STREAK */}
          {taskStreakStatus && (
            <div className="space-y-6 animate-in" style={{ animationDelay: "150ms" }}>
              <div className="flex items-center gap-3">
                 <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 shadow-sm border border-blue-500/10">
                    <Trophy className="w-5 h-5" />
                 </div>
                 <div className="flex flex-col">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground/60 leading-none">Task Completion Streak</h3>
                    <div className="h-0.5 w-8 bg-blue-500/30 mt-1.5 rounded-full" />
                 </div>
              </div>
              <TaskStreakDisplay 
                 currentStreak={taskStreakStatus.currentStreak}
                 longestStreak={taskStreakStatus.longestStreak}
                 totalPoints={taskStreakStatus.totalPoints}
                 nextMilestoneDays={taskStreakStatus.nextMilestone?.days}
                 daysToNext={taskStreakStatus.daysToNext}
                 hasCompletedToday={taskStreakStatus.hasCompletedToday}
                 streakAtRisk={taskStreakStatus.streakAtRisk}
              />
            </div>
          )}
        </div>

        {/* ACHIEVEMENTS GRID */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground/60">Your Achievements</h2>
          </div>
          <BadgeGrid 
            badges={(intern.intern_badges || []).map((ib: any) => ({
              id: ib.badge.id,
              name: ib.badge.name,
              icon: ib.badge.icon,
              description: ib.badge.description,
              earned_at: ib.earned_at
            }))} 
          />
        </div>
      </div>
    </div>
  );
}

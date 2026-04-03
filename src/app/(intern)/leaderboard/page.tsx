"use client";

import { useEffect, useState } from "react";
import { 
  Trophy, 
  Medal, 
  Flame, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Loader2, 
  Building2,
  ChevronRight,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Intern Leaderboard Page
 */
export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const url = departmentId 
          ? `/api/intern/leaderboard?department=${departmentId}` 
          : "/api/intern/leaderboard";
        const res = await fetch(url);
        const json = await res.json();
        if (json.success) {
          setLeaderboard(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, [departmentId]);

  const filteredLeaderboard = leaderboard.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const top3 = filteredLeaderboard.slice(0, 3);
  const remaining = filteredLeaderboard.slice(3);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4 space-y-10">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary mb-2"
        >
          <Trophy className="w-8 h-8" />
        </motion.div>
        <h1 className="text-4xl font-black tracking-tight">Intern Hall of Fame</h1>
        <p className="text-muted-foreground font-medium max-w-lg mx-auto">
          Recognizing consistent performance and dedication across the organization.
        </p>
      </div>

      {/* Podium for Top 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-10">
        {/* Rank 2 */}
        <PodiumItem item={top3[1]} rank={2} color="text-slate-400" bgColor="bg-slate-500/10" borderColor="border-slate-500/20" />
        {/* Rank 1 */}
        <PodiumItem item={top3[0]} rank={1} color="text-yellow-500" bgColor="bg-yellow-500/10" borderColor="border-yellow-500/20" isWinner />
        {/* Rank 3 */}
        <PodiumItem item={top3[2]} rank={3} color="text-amber-700" bgColor="bg-amber-700/10" borderColor="border-amber-700/20" />
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-muted/30 p-4 rounded-3xl border border-border/50">
         <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search interns..." 
              className="pl-9 rounded-2xl border-none bg-background/50 focus-visible:ring-primary"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
         </div>
         <div className="flex items-center gap-2">
            <Badge 
              variant={!departmentId ? "active" : "secondary"} 
              className="cursor-pointer px-4 py-1.5 rounded-xl uppercase tracking-widest text-[10px] font-black"
              onClick={() => setDepartmentId(null)}
            >
              Global
            </Badge>
            {/* Logic for dept badges could go here if we fetch depts */}
         </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {remaining.map((item, index) => (
          <LeaderboardRow key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function PodiumItem({ item, rank, color, bgColor, borderColor, isWinner }: any) {
  if (!item) return <div className="hidden md:block" />;
  
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: rank * 0.1 }}
      className={cn(
        "relative flex flex-col items-center p-8 rounded-[2.5rem] border glass-card transition-all duration-500 hover:shadow-2xl",
        borderColor,
        isWinner ? "md:scale-110 md:-translate-y-6 z-10" : "opacity-80 hover:opacity-100"
      )}
    >
      <div className={cn("absolute -top-6 p-4 rounded-3xl border shadow-xl z-20", bgColor, borderColor)}>
        <Medal className={cn("w-8 h-8", color)} />
      </div>
      
      <div className="mt-4 flex flex-col items-center text-center space-y-2">
         <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border-2 border-border/50 shadow-inner overflow-hidden">
             {/* Avatar logic could go here */}
             <span className="text-xl font-black text-muted-foreground/50">{item.name[0]}</span>
         </div>
         <div>
            <h3 className="font-black tracking-tight line-clamp-1">{item.name}</h3>
            <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">
               {item.department}
            </p>
         </div>
         <div className="flex items-center gap-3 pt-2">
            <div className="flex flex-col items-center">
               <span className="text-lg font-black text-primary leading-none">{item.points}</span>
               <span className="text-[8px] uppercase font-black text-muted-foreground">Pts</span>
            </div>
            <div className="w-[1px] h-6 bg-border/50" />
            <div className="flex flex-col items-center">
               <span className="text-lg font-black text-orange-500 leading-none">{item.streak}</span>
               <span className="text-[8px] uppercase font-black text-muted-foreground">Streak</span>
            </div>
         </div>
      </div>

      {item.badges.length > 0 && (
         <div className="flex gap-1.5 mt-4">
            {item.badges.slice(0, 4 - rank).map((badge: any, i: number) => (
               <div 
                 key={i} 
                 className="p-1.5 rounded-lg bg-background shadow-inner border border-border/50 group/badge transition-all"
                 title={badge.name}
               >
                  <Medal className={cn("w-3 h-3", color, "opacity-70 group-hover/badge:opacity-100")} />
               </div>
            ))}
         </div>
      )}

      {item.isCurrentUser && (
         <Badge className="absolute bottom-4 uppercase text-[8px] font-black tracking-widest px-2">You</Badge>
      )}
    </motion.div>
  );
}

function LeaderboardRow({ item }: any) {
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={cn(
        "flex items-center gap-4 p-4 rounded-3xl border glass-card group transition-all duration-300 hover:shadow-xl hover:border-primary/20",
        item.isCurrentUser ? "border-primary/30 bg-primary/5" : "border-border/50"
      )}
    >
      <div className="w-8 text-center font-black text-muted-foreground/40 group-hover:text-primary transition-colors">
        #{item.rank}
      </div>
      
      <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center border border-border/50 shrink-0">
         <span className="font-black text-sm">{item.name[0]}</span>
      </div>

      <div className="flex-grow">
        <h4 className="font-black tracking-tight text-sm flex items-center gap-2">
          {item.name}
          {item.isCurrentUser && <Badge className="text-[7px] uppercase h-4 px-1.5 font-black">You</Badge>}
        </h4>
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{item.department}</p>
      </div>

      <div className="flex items-center gap-6 pr-4">
         <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-primary fill-primary/20" />
            <span className="font-black text-sm">{item.points}</span>
         </div>
         <div className="flex items-center gap-1.5 hidden md:flex">
            <Flame className="w-3 h-3 text-orange-500" />
            <span className="font-black text-sm">{item.streak}</span>
         </div>
         <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-[10px] font-bold text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">+1</span>
         </div>
         <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
      </div>
    </motion.div>
  );
}

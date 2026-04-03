"use client";

import { 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis,
  Cell
} from "recharts";
import { Users } from "lucide-react";

interface TopInternsBarProps {
  data: { name: string; score: number; color?: string }[];
}

export function TopInternsBar({ data }: TopInternsBarProps) {
  if (!data || data.length === 0) {
    return (
      <div className="premium-glass glass-noise rounded-[2.5rem] p-6 relative overflow-hidden flex flex-col justify-center items-center h-[350px]">
        <Users className="h-8 w-8 text-muted-foreground/30 mb-4 animate-pulse" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">No leaderboard data</p>
      </div>
    );
  }

  // Pre-assign vibrant colors based on rank
  const colors = ["#1e3a8a", "#1d4ed8", "#2563eb", "#3b82f6", "#60a5fa"];
  const formattedData = data.slice(0, 5).map((d, i) => ({
    ...d,
    color: colors[i % colors.length]
  }));

  return (
    <div className="premium-glass glass-noise rounded-[2.5rem] p-8 relative overflow-hidden h-full min-h-[350px]">
      {/* Background Glows */}
      <div className="glow-blob -bottom-20 -right-20 bg-blue-500/10" />

      <div className="relative z-10 flex flex-col h-full">
        <div>
          <h2 className="text-2xl font-black tracking-tight drop-shadow-sm">Top Performers</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mt-1">Highest Performance Score</p>
        </div>
        
        <div className="h-[250px] w-full mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                fontSize={11}
                fontWeight={900}
                className="text-foreground drop-shadow-sm uppercase tracking-wider"
                width={120}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)', radius: 8 }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                     const data = payload[0].payload;
                    return (
                      <div className="premium-glass rounded-2xl p-3 shadow-2xl backdrop-blur-xl border border-white/5 flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-white text-[10px]" style={{ backgroundColor: data.color, boxShadow: `0 0 10px ${data.color}80` }}>
                            {data.name.charAt(0)}
                         </div>
                         <div>
                           <p className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/80 mb-0.5">
                             {data.name}
                           </p>
                           <p className="text-xl font-black tracking-tighter" style={{ color: data.color }}>
                             {data.score} <span className="text-[9px] uppercase tracking-widest text-muted-foreground/50 ml-1">SCORE</span>
                           </p>
                         </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="score" 
                radius={8} 
                barSize={20}
                animationDuration={1500}
              >
                {formattedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: `drop-shadow(0 0 6px ${entry.color}60)` }} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

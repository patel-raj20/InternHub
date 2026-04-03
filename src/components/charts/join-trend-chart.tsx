"use client";

import { 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis,
  CartesianGrid,
  Cell
} from "recharts";

interface JoinTrendChartProps {
  data: { name: string; total: number }[];
}

export function JoinTrendChart({ data }: JoinTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="premium-glass glass-noise rounded-[2.5rem] p-6 relative overflow-hidden flex flex-col justify-center items-center h-[350px]">
        <div className="h-8 w-8 rounded-full bg-blue-500/20 mb-4 animate-pulse flex items-center justify-center">
            <div className="h-4 w-4 bg-blue-500 rounded-full" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">No trend data</p>
      </div>
    );
  }

  return (
    <div className="premium-glass glass-noise rounded-[2.5rem] p-8 relative overflow-hidden h-full min-h-[350px]">
      <div className="glow-blob -top-20 -right-20 bg-blue-500/10" />
      <div className="glow-blob -bottom-20 -left-20 bg-primary/10" />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black tracking-tight drop-shadow-sm">Monthly Joining Trend</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mt-1">Enrollments per month</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
            <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 drop-shadow-sm">Growth</span>
          </div>
        </div>

        <div className="h-[250px] w-full mt-4 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                 <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={1} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.4} />
                 </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="name" 
                stroke="currentColor" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                className="text-muted-foreground/50 font-black uppercase tracking-widest"
              />
              <YAxis 
                stroke="currentColor" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `${value}`}
                allowDecimals={false}
                className="text-muted-foreground/50 font-black"
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 8 }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                     const val = payload[0].value;
                     const name = payload[0].payload.name;
                    return (
                      <div className="premium-glass rounded-2xl p-4 shadow-2xl backdrop-blur-xl border border-white/5 flex items-center gap-3">
                         <div className="w-2 h-10 rounded-full bg-primary" style={{ boxShadow: `0 0 10px var(--primary)` }} />
                         <div>
                           <p className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/80 mb-0.5">
                             {name}
                           </p>
                           <p className="text-2xl font-black text-primary drop-shadow-[0_0_8px_rgba(0,122,255,0.4)]">
                             {val} <span className="text-[9px] uppercase tracking-widest text-muted-foreground/50 ml-1">Joined</span>
                           </p>
                         </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="total"
                radius={[8, 8, 8, 8]}
                animationDuration={2000}
                animationEasing="ease-in-out"
                barSize={24}
              >
                 {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="url(#trendGradient)" style={{ filter: `drop-shadow(0 0 8px rgba(0,122,255,0.4))` }} />
                 ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

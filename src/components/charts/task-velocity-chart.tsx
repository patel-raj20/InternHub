"use client";

import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis,
  CartesianGrid
} from "recharts";
import { cn } from "@/lib/utils";
import { Activity } from "lucide-react";

interface TaskVelocityChartProps {
  data: { date: string; completed: number }[];
}
export function TaskVelocityChart({ data }: TaskVelocityChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-full min-h-[300px] w-full mt-4">
        <Activity className="h-8 w-8 text-muted-foreground/30 mb-4 animate-pulse" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">No task velocity data</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full pt-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 px-2">
        <div className="mb-4 md:mb-0">
          <h2 className="text-3xl font-black tracking-tight text-foreground/90">Task Completion Velocity</h2>
          <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/50 mt-1">30 Day Trend Analysis</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(0,122,255,0.8)]" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary drop-shadow-sm">Live Focus</span>
        </div>
      </div>
      
      <div className="h-[220px] w-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="date" 
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
              tickMargin={10}
            />
            <Tooltip 
              cursor={{ stroke: 'var(--primary)', strokeWidth: 1, strokeDasharray: '4 4', fill: 'transparent' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="premium-glass rounded-2xl border-border/20 p-4 shadow-2xl backdrop-blur-xl">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 mb-2">
                        {payload[0].payload.date}
                      </p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-black text-primary drop-shadow-[0_0_8px_rgba(0,122,255,0.4)]">
                          {payload[0].value}
                        </p>
                        <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Tasks Done</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="completed"
              stroke="var(--primary)"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorCompleted)"
              activeDot={{ r: 6, fill: "var(--primary)", stroke: "white", strokeWidth: 2 }}
              animationDuration={2000}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

"use client";

import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Legend
} from "recharts";
import { cn } from "@/lib/utils";
import { PieChart as PieChartIcon } from "lucide-react";

interface TaskStatusDonutProps {
  data: { name: string; value: number; color: string }[];
}

export function TaskStatusDonut({ data }: TaskStatusDonutProps) {
  if (!data || data.length === 0 || data.every(d => d.value === 0)) {
    return (
      <div className="premium-glass glass-noise rounded-[2.5rem] p-6 relative overflow-hidden flex flex-col justify-center items-center h-[350px]">
        <PieChartIcon className="h-8 w-8 text-muted-foreground/30 mb-4 animate-pulse" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">No task status data</p>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="premium-glass glass-noise rounded-[2.5rem] p-8 relative overflow-hidden h-full min-h-[350px]">
      {/* Background Glows */}
      <div className="glow-blob -top-10 -right-10 bg-blue-600/10" />
      <div className="glow-blob -bottom-10 -left-10 bg-blue-400/10" />

      <div className="relative z-10 flex flex-col h-full">
        <div>
          <h2 className="text-2xl font-black tracking-tight drop-shadow-sm">Task Overview</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mt-1">Current Department Load</p>
        </div>
        
        <div className="h-[250px] w-full mt-6 relative flex-1">
          {/* Centered Total */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
             <span className="text-4xl font-black tracking-tighter drop-shadow-sm">{total}</span>
             <span className="text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground/60">Total Tasks</span>
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={95}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
                animationDuration={1500}
                cornerRadius={8}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: `drop-shadow(0 0 8px ${entry.color}80)` }} />
                ))}
              </Pie>
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="premium-glass rounded-2xl p-4 shadow-2xl backdrop-blur-xl border border-white/5 flex items-center gap-4">
                        <div className="w-2 h-10 rounded-full" style={{ backgroundColor: data.color, boxShadow: `0 0 10px ${data.color}` }} />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 mb-1">
                            {data.name}
                          </p>
                          <p className="text-2xl font-black" style={{ color: data.color }}>
                            {data.value} <span className="text-[10px] text-muted-foreground/50 ml-1">TASKS</span>
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Custom Legend */}
        <div className="flex justify-center gap-6 mt-4">
          {data.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: entry.color, boxShadow: `0 0 6px ${entry.color}80` }} 
              />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/80">{entry.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

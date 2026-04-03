"use client";

import { 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis,
  LabelList,
  Cell
} from "recharts";
import { School } from "lucide-react";

interface TopCollegesChartProps {
  data: { name: string; total: number }[];
}

export function TopCollegesChart({ data }: TopCollegesChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="premium-glass glass-noise rounded-[2.5rem] p-6 relative overflow-hidden flex flex-col justify-center items-center h-[350px]">
        <School className="h-8 w-8 text-muted-foreground/30 mb-4 animate-pulse" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">No college data</p>
      </div>
    );
  }

  // Take top 5 colleges for better visualization
  const displayData = [...data].sort((a, b) => b.total - a.total).slice(0, 5);
  const colors = ["#1e3a8a", "#1d4ed8", "#2563eb", "#3b82f6", "#60a5fa"];
  const formattedData = displayData.map((d, i) => ({ ...d, color: colors[i % colors.length] }));

  return (
    <div className="premium-glass glass-noise rounded-[2.5rem] p-8 relative overflow-hidden h-full min-h-[350px]">
      <div className="glow-blob -bottom-20 -right-20 bg-blue-600/10" />
      <div className="glow-blob -top-10 -left-10 bg-blue-400/10" />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <div>
             <h2 className="text-2xl font-black tracking-tight drop-shadow-sm flex items-center gap-2">
               <School className="w-5 h-5 text-primary drop-shadow-[0_0_8px_rgba(0,122,255,0.6)]" />
               Top Colleges
             </h2>
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mt-1">Primary Talent Sources</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(0,122,255,0.8)]" />
            <span className="text-[9px] font-black uppercase tracking-widest text-primary drop-shadow-sm">Demographics</span>
          </div>
        </div>

        <div className="h-[250px] w-full mt-4 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={formattedData} 
              layout="vertical" 
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
               <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false}
                tickLine={false}
                fontSize={10}
                stroke="currentColor"
                width={120}
                tick={(props) => {
                  const { x, y, payload } = props;
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text
                        x={-10}
                        y={0}
                        dy={4}
                        textAnchor="end"
                        fill="currentColor"
                        className="text-foreground/90 font-black tracking-widest"
                        fontSize={9}
                      >
                        {payload.value.length > 20 ? `${payload.value.slice(0, 18)}...` : payload.value}
                      </text>
                    </g>
                  );
                }}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 8 }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="premium-glass rounded-2xl p-4 shadow-2xl backdrop-blur-xl border border-white/5 flex items-center gap-3">
                         <div className="w-2 h-10 rounded-full" style={{ backgroundColor: d.color, boxShadow: `0 0 10px ${d.color}` }} />
                         <div>
                           <p className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/80 mb-0.5">
                             {d.name}
                           </p>
                           <p className="text-2xl font-black" style={{ color: d.color, textShadow: `0 0 8px ${d.color}60` }}>
                             {d.total} <span className="text-[9px] uppercase tracking-widest text-muted-foreground/50 ml-1">Interns</span>
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
                barSize={18}
              >
                {formattedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: `drop-shadow(0 0 6px ${entry.color}60)` }} />
                ))}
                <LabelList 
                  dataKey="total" 
                  position="right" 
                  className="fill-foreground/80 font-black text-[11px]"
                  offset={10}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

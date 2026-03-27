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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { School } from "lucide-react";

interface TopCollegesChartProps {
  data: { name: string; total: number }[];
}

export function TopCollegesChart({ data }: TopCollegesChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="h-full border-border/50 glass-card">
        <CardHeader>
           <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 text-center py-20">No college data available</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  // Take top 5 colleges for better visualization
  const displayData = [...data].sort((a, b) => b.total - a.total).slice(0, 5);

  return (
    <Card className="h-full border-border/50 glass-card group overflow-hidden shadow-xl">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 flex items-center gap-2">
            <School className="w-3.5 h-3.5 text-primary neon-glow" />
            Top Colleges
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary neon-glow" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Talent Source</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[320px] min-h-[320px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={displayData} 
              layout="vertical" 
              margin={{ top: 5, right: 40, left: 0, bottom: 5 }}
              barGap={12}
            >
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={1} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.6} />
                </linearGradient>
              </defs>
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
                        className="text-muted-foreground/80 font-black uppercase tracking-tighter"
                        fontSize={9}
                      >
                        {payload.value.length > 20 ? `${payload.value.slice(0, 18)}...` : payload.value}
                      </text>
                    </g>
                  );
                }}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 4 }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="glass-card rounded-xl border-border/50 p-2.5 shadow-2xl backdrop-blur-xl">
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">
                          {payload[0].payload.name}
                        </p>
                        <p className="text-sm font-black text-primary">
                          {payload[0].value} <span className="text-[10px] opacity-60">Interns</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="total"
                radius={[0, 4, 4, 0]}
                animationDuration={2000}
                barSize={18}
              >
                {displayData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="url(#barGradient)" />
                ))}
                <LabelList 
                  dataKey="total" 
                  position="right" 
                  className="fill-primary font-black text-[10px]"
                  offset={10}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

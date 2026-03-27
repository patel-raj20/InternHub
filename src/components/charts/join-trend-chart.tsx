"use client";

import { 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis,
  CartesianGrid
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface JoinTrendChartProps {
  data: { name: string; total: number }[];
}

export function JoinTrendChart({ data }: JoinTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="col-span-full lg:col-span-8 border-border/50">
        <CardHeader>
           <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 text-center py-20">No joining trend data available</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="col-span-full lg:col-span-8 border-border/50 overflow-hidden shadow-xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Monthly Joining Trend</CardTitle>
            <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest leading-none">Enrollments per month</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 neon-glow" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Analytics</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] min-h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="name" 
                stroke="currentColor" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                className="text-muted-foreground/40 font-bold uppercase tracking-widest"
              />
              <YAxis 
                stroke="currentColor" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `${value}`}
                allowDecimals={false}
                className="text-muted-foreground/40 font-bold"
              />
              <Tooltip 
                cursor={{ fill: 'var(--primary)', opacity: 0.05 }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="glass-card rounded-xl border-border/50 p-3 shadow-2xl">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                          {payload[0].payload.name}
                        </p>
                        <p className="text-sm font-black text-primary">
                          {payload[0].value} <span className="text-[10px] opacity-60">Joined</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="total"
                fill="var(--primary)"
                radius={[6, 6, 0, 0]}
                animationDuration={1500}
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
  { name: "Jan", total: 100 },
  { name: "Feb", total: 120 },
  { name: "Mar", total: 170 },
  { name: "Apr", total: 140 },
  { name: "May", total: 210 },
  { name: "Jun", total: 190 },
  { name: "Jul", total: 240 },
  { name: "Aug", total: 280 },
  { name: "Sep", total: 260 },
  { name: "Oct", total: 320 },
];

export function GrowthChart() {
  return (
    <Card className="col-span-4 border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Performance Analytics</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary neon-glow" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Live</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Fixed height container to prevent Recharts -1 width/height errors */}
        <div className="h-[300px] min-h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
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
                className="text-muted-foreground/40 font-bold"
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="glass-card rounded-xl border-border/50 p-3 shadow-2xl">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
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
              <Area
                type="monotone"
                dataKey="total"
                stroke="var(--primary)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorTotal)"
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

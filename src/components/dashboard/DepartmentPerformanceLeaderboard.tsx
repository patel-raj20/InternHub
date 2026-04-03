"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie, Legend 
} from 'recharts';
import { Trophy, TrendingUp, Users, Award, Zap, ChevronLeft, Target, Activity } from 'lucide-react';
import { Department, Intern } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface DeptGraphData {
  id: string;
  name: string;
  top1: number;
  top2: number;
  top3: number;
  others: number;
  totalPoints: number;
  interns: Intern[];
  top3Interns: Intern[];
}

interface Props {
  departments: Department[];
  interns: Intern[];
}

const STACK_COLORS = ["#2563eb", "#3b82f6", "#60a5fa", "rgba(255,255,255,0.05)"];
const PIE_COLORS = ["#1e40af", "#1d4ed8", "#3b82f6", "#60a5fa", "#93c5fd"];

export default function DepartmentPerformanceLeaderboard({ departments, interns }: Props) {
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);

  // 1. Process Data for Stacked Bar Chart
  const chartData = useMemo(() => {
    return departments.map(dept => {
      const deptInterns = interns.filter(i => i.user?.department_id === dept.id);
      const sortedInterns = [...deptInterns].sort((a, b) => (b.total_points || 0) - (a.total_points || 0));
      
      const top1 = sortedInterns[0]?.total_points || 0;
      const top2 = sortedInterns[1]?.total_points || 0;
      const top3 = sortedInterns[2]?.total_points || 0;
      const totalPoints = sortedInterns.reduce((sum, i) => sum + (i.total_points || 0), 0);
      const others = Math.max(0, totalPoints - (top1 + top2 + top3));

      return {
        id: dept.id,
        name: dept.name,
        top1,
        top2,
        top3,
        others,
        totalPoints,
        interns: deptInterns,
        top3Interns: sortedInterns.slice(0, 3)
      };
    }).sort((a, b) => b.totalPoints - a.totalPoints);
  }, [departments, interns]);

  const selectedDept = useMemo(() => 
    chartData.find(d => d.id === selectedDeptId), 
    [chartData, selectedDeptId]
  );

  // 2. Process Pie Data for Selected Department
  const pieData = useMemo(() => {
    if (!selectedDept) return [];
    return [
      { name: selectedDept.top3Interns[0]?.user?.first_name || "Top 1", value: selectedDept.top1 },
      { name: selectedDept.top3Interns[1]?.user?.first_name || "Top 2", value: selectedDept.top2 },
      { name: selectedDept.top3Interns[2]?.user?.first_name || "Top 3", value: selectedDept.top3 },
      { name: "Others", value: selectedDept.others }
    ].filter(d => d.value > 0);
  }, [selectedDept]);

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className={cn(
      "border rounded-[1.5rem] p-6 backdrop-blur-xl shadow-2xl transition-all duration-300 h-full flex flex-col",
      isDark 
        ? "bg-white/[0.04] border-white/[0.08]" 
        : "bg-white border-slate-200 shadow-xl"
    )}>
      <div className="space-y-8 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight uppercase">Performance Analytics</h3>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">
                {selectedDept ? `Drill-down: ${selectedDept.name}` : "Company-wide performance benchmarks"}
              </p>
            </div>
          </div>

          {selectedDept && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedDeptId(null)}
              className="rounded-xl h-8 px-3 text-[10px] font-black uppercase tracking-widest hover:bg-white/5"
            >
              <ChevronLeft className="w-3 h-3 mr-1" /> Reset Selection
            </Button>
          )}
        </div>

        <div className="relative flex-grow min-h-[400px]">
          <AnimatePresence mode="wait">
            {chartData.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="h-[400px] flex flex-col items-center justify-center opacity-20"
              >
                 <Activity size={48} className="mb-4" />
                 <p className="text-[10px] font-black uppercase tracking-widest text-center">
                    Awaiting telemetry... <br/> Ensure departments and interns are registered.
                 </p>
              </motion.div>
            ) : !selectedDeptId ? (
              <motion.div
                key="bar-view"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-[400px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={chartData} 
                    layout="vertical" 
                    margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
                    onClick={(data) => {
                      if (data && data.activeLabel) {
                        const dept = chartData.find(d => d.name === data.activeLabel);
                        if (dept) setSelectedDeptId(dept.id);
                      }
                    }}
                  >
                    <XAxis type="number" hide />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      fontSize={10} 
                      fontWeight={900} 
                      width={100}
                      className="uppercase tracking-tighter"
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 8 }}
                      content={<CustomBarTooltip />}
                    />
                    <Bar 
                      dataKey="top1" 
                      stackId="a" 
                      fill={STACK_COLORS[0]} 
                      radius={[4, 0, 0, 4]} 
                      barSize={24} 
                      className="cursor-pointer"
                      onClick={(data) => setSelectedDeptId(data.id || null)}
                    />
                    <Bar 
                      dataKey="top2" 
                      stackId="a" 
                      fill={STACK_COLORS[1]} 
                      barSize={24} 
                      className="cursor-pointer"
                      onClick={(data) => setSelectedDeptId(data.id || null)}
                    />
                    <Bar 
                      dataKey="top3" 
                      stackId="a" 
                      fill={STACK_COLORS[2]} 
                      barSize={24} 
                      className="cursor-pointer"
                      onClick={(data) => setSelectedDeptId(data.id || null)}
                    />
                    <Bar 
                      dataKey="others" 
                      stackId="a" 
                      fill={STACK_COLORS[3]} 
                      radius={[0, 4, 4, 0]} 
                      barSize={24} 
                      className="cursor-pointer"
                      onClick={(data) => setSelectedDeptId(data.id || null)}
                    />
                  </BarChart>
                </ResponsiveContainer>
                <div className="absolute bottom-[-10px] left-0 right-0 flex justify-center gap-6 text-[8px] font-black uppercase tracking-widest text-muted-foreground/50">
                   <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{backgroundColor: STACK_COLORS[0]}}/> Top 1</div>
                   <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{backgroundColor: STACK_COLORS[1]}}/> Top 2</div>
                   <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{backgroundColor: STACK_COLORS[2]}}/> Top 3</div>
                   <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-white/10"/> Rest</div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="pie-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="flex flex-col items-center justify-center h-[400px]"
              >
                 <div className="w-full h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={8}
                        dataKey="value"
                        animationBegin={200}
                      >
                        {pieData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={PIE_COLORS[index % PIE_COLORS.length]} 
                            stroke="none"
                            style={{ filter: `drop-shadow(0 0 8px ${PIE_COLORS[index % PIE_COLORS.length]}40)` }}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                      <Legend 
                        verticalAlign="bottom" 
                        align="center"
                        formatter={(value) => <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 px-2">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                 </div>
                 <div className="mt-4 text-center">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Point Contribution Breakdown</p>
                    <h4 className="text-2xl font-black tracking-tighter mt-1">{selectedDept?.totalPoints.toLocaleString()} Total Points</h4>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Insight */}
        {!selectedDeptId && (
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-4">
            <Zap className="w-4 h-4 text-primary animate-pulse" />
            <p className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest leading-relaxed">
              Click any department bar to drill-down into individual intern contributions and point distribution.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const CustomBarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as DeptGraphData;
    return (
      <div className="premium-glass rounded-2xl p-4 shadow-2xl backdrop-blur-xl border border-white/5 min-w-[180px]">
        <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
          <Target size={14} className="text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white">{data.name}</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider">
            <span className="text-muted-foreground">Top 1 ({data.top3Interns[0]?.user?.first_name || "N/A"})</span>
            <span className="text-white">{data.top1}</span>
          </div>
          <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider">
            <span className="text-muted-foreground">Top 2 ({data.top3Interns[1]?.user?.first_name || "N/A"})</span>
            <span className="text-white">{data.top2}</span>
          </div>
          <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider">
            <span className="text-muted-foreground">Top 3 ({data.top3Interns[2]?.user?.first_name || "N/A"})</span>
            <span className="text-white">{data.top3}</span>
          </div>
          <div className="flex justify-between items-center text-[9px] font-bold uppercase border-t border-white/5 pt-2">
            <span className="text-primary">Total Dept Points</span>
            <span className="text-primary font-black">{data.totalPoints}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="premium-glass rounded-2xl p-3 shadow-2xl backdrop-blur-xl border border-white/5 border-l-4" style={{borderLeftColor: data.fill}}>
        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-0.5">{data.name}</p>
        <p className="text-lg font-black tracking-tighter text-white">{data.value.toLocaleString()} <span className="text-[8px] uppercase tracking-widest ml-1 opacity-50">PTS</span></p>
      </div>
    );
  }
  return null;
};

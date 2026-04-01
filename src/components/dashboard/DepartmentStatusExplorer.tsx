"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector
} from 'recharts';
import { Building2, Users, Mail, User } from 'lucide-react';
import { graphqlService } from "@/lib/services/graphql-service";
import { Organization, Department, Intern } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import toast from "react-hot-toast";

const SLICE_COLORS = ['#00D4FF','#7C3AED','#10B981','#F59E0B','#EF4444','#EC4899'];
const STATUS_COLORS: Record<string, string> = { 
  Active: '#00D4FF', 
  Completed: '#10B981', 
  Pending: '#F59E0B' 
};

interface DeptData extends Department {
  active: number;
  completed: number;
  pending: number;
}

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 8}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
    </g>
  );
};

export default function DepartmentStatusExplorer() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [mounted, setMounted] = useState(false);
  
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [departments, setDepartments] = useState<DeptData[]>([]);
  const [activeDeptIndex, setActiveDeptIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { role, organization_id } = useSelector((state: RootState) => state.user);
  const isDev = role === "DEVELOPER";

  useEffect(() => {
    setMounted(true);
    
    if (!isDev && organization_id) {
       setSelectedOrgId(organization_id);
       return;
    }

    const fetchOrgs = async () => {
      try {
        const orgs = await graphqlService.getOrganizations();
        setOrganizations(orgs);
        if (orgs.length > 0) setSelectedOrgId(orgs[0].id);
      } catch (error) {
        console.error("Failed to fetch organizations:", error);
      }
    };
    fetchOrgs();
  }, [isDev, organization_id]);

  useEffect(() => {
    if (!selectedOrgId) return;

    const fetchDeptStats = async () => {
      setIsLoading(true);
      setActiveDeptIndex(null);
      try {
        const [depts, interns] = await Promise.all([
          graphqlService.getDepartments(selectedOrgId),
          graphqlService.getInterns(selectedOrgId)
        ]);

        // Aggregate status counts per department
        const enrichedDepts = depts.map(dept => {
          const deptInterns = interns.filter(i => i.user?.department_id === dept.id);
          return {
            ...dept,
            active: deptInterns.filter(i => i.user?.status === 'ACTIVE').length,
            completed: deptInterns.filter(i => i.user?.status === 'COMPLETED').length,
            pending: (deptInterns.length - deptInterns.filter(i => ['ACTIVE', 'COMPLETED'].includes(i.user?.status)).length) || 0
          };
        }) as DeptData[];

        setDepartments(enrichedDepts);
      } catch (error) {
        console.error("Failed to fetch department stats:", error);
        toast.error("Error loading departmental data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeptStats();
  }, [selectedOrgId]);

  const activeDept = activeDeptIndex !== null ? departments[activeDeptIndex] : null;

  const donutData = useMemo(() => {
    if (!activeDept) return [];
    return [
      { name: 'Active', value: activeDept.active, color: STATUS_COLORS.Active },
      { name: 'Completed', value: activeDept.completed, color: STATUS_COLORS.Completed },
      { name: 'Pending', value: activeDept.pending, color: STATUS_COLORS.Pending },
    ].filter(d => d.value > 0);
  }, [activeDept]);

  if (!mounted) return null;
  const totalDeptInterns = activeDept?.intern_count || 0;

  return (
    <div className={cn(
      "border rounded-[1.5rem] p-6 backdrop-blur-xl shadow-2xl transition-all duration-300 h-full flex flex-col",
      isDark 
        ? "bg-white/[0.04] border-white/[0.08]" 
        : "bg-white border-slate-200 shadow-xl"
    )}>
      
      {/* TOP ROW: Org Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <Building2 className="text-primary w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight leading-none">Status Explorer</h3>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
              {isDev ? "Lifecycle analytics per department" : "Your organization's lifecycle analytics"}
            </p>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow">
        
        {/* LEFT PANEL: Pie Chart */}
        <div className="lg:col-span-12 xl:col-span-5 flex flex-col">
          <div className="h-[260px] w-full relative">
            {isLoading ? (
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
               </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#0f172a]/95 border border-white/10 backdrop-blur-md p-3 rounded-xl shadow-2xl">
                            <p className="text-xs font-black text-white">{data.name} — {data.intern_count} interns</p>
                            <p className="text-[10px] text-slate-400 font-medium mt-1">Head: {data.head?.first_name} {data.head?.last_name}</p>
                            <p className="text-[10px] text-slate-500 italic">{data.head?.email}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Pie
                    data={departments}
                    dataKey="intern_count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    stroke="none"
                    onClick={(_, index) => setActiveDeptIndex(index)}
                    activeIndex={activeDeptIndex === null ? undefined : activeDeptIndex}
                    activeShape={renderActiveShape}
                  >
                    {departments.map((_, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={SLICE_COLORS[index % SLICE_COLORS.length]} 
                        className="cursor-pointer transition-all duration-300 hover:opacity-80 outline-none"
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Custom Legend */}
          <div className="mt-4 space-y-2 flex-grow overflow-y-auto max-h-[180px] pr-2 custom-scrollbar">
            {departments.map((dept, idx) => (
              <div 
                key={dept.id}
                onClick={() => setActiveDeptIndex(idx)}
                className={cn(
                  "flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all group",
                  activeDeptIndex === idx ? "bg-white/10 ring-1 ring-white/10" : "hover:bg-white/5"
                )}
              >
                <div 
                  className="w-3 h-3 rounded-sm flex-shrink-0" 
                  style={{ backgroundColor: SLICE_COLORS[idx % SLICE_COLORS.length] }} 
                />
                <div className="flex-grow min-w-0">
                  <p className="text-[11px] font-black tracking-tight truncate">{dept.name}</p>
                  <p className="text-[9px] text-muted-foreground/60 truncate italic">
                    {dept.head?.first_name} {dept.head?.last_name?.[0]}. · {dept.head?.email}
                  </p>
                </div>
                <span className="text-xs font-black ml-2">{dept.intern_count}</span>
              </div>
            ))}
            {!isLoading && departments.length === 0 && (
              <div className="h-full flex items-center justify-center py-10 opacity-20 flex-col gap-2">
                <Users size={24} />
                <p className="text-[10px] font-black uppercase tracking-widest">No department data</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Status Donut */}
        <div className="lg:col-span-12 xl:col-span-7 bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[350px]">
          {activeDept ? (
            <div className="w-full h-full flex flex-col items-center">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SLICE_COLORS[activeDeptIndex! % SLICE_COLORS.length] }} />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {activeDept.name} · {organizations.find(o => o.id === selectedOrgId)?.name}
                </span>
              </div>

              <div className="w-full h-[220px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius="65%"
                      outerRadius="85%"
                      dataKey="value"
                      stroke="none"
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-black tracking-tighter tabular-nums">{totalDeptInterns}</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">total interns</span>
                </div>
              </div>

              {/* Status Legend */}
              <div className="w-full mt-6 space-y-2">
                {['Active', 'Completed', 'Pending'].map((status) => {
                  const val = (activeDept as any)[status.toLowerCase()] || 0;
                  const pct = totalDeptInterns > 0 ? Math.round((val / totalDeptInterns) * 100) : 0;
                  return (
                    <div key={status} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[status] }} />
                        <span className="text-[11px] font-bold text-slate-300">{status}</span>
                      </div>
                      <span className="text-[11px] font-black tabular-nums">
                        {val} <span className="text-[9px] text-muted-foreground/60 font-medium ml-1">({pct}%)</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4 opacity-30">
              <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center border border-white/5">
                <PieChart size={24} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest max-w-[150px] mx-auto leading-relaxed">
                Select a department from the pie chart to view breakdown
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

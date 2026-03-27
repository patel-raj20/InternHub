"use client";

import { Department, Intern } from "@/lib/types";
import { Users, Building2, TrendingUp, GraduationCap, Briefcase, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OrganizationStatsProps {
  departments: Department[];
  interns: Intern[];
}

export function OrganizationStats({ departments, interns }: OrganizationStatsProps) {
  const totalInterns = interns.length;
  const totalDepartments = departments.length;
  
  // Calculate some simple metrics
  const activeInterns = interns.filter(i => !i.end_date || new Date(i.end_date) > new Date()).length;
  const completedInterns = totalInterns - activeInterns;
  
  // Department distribution
  const deptDist = departments.map(d => ({
    name: d.name,
    count: d.intern_count || 0
  })).sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Interns" 
          value={totalInterns} 
          icon={<Users className="text-blue-500" />} 
          description="Total registered interns"
          color="blue"
        />
        <StatsCard 
          title="Active Now" 
          value={activeInterns} 
          icon={<TrendingUp className="text-emerald-500" />} 
          description="Interns currently in tenure"
          color="emerald"
        />
        <StatsCard 
          title="Departments" 
          value={totalDepartments} 
          icon={<Building2 className="text-violet-500" />} 
          description="Operational units"
          color="violet"
        />
        <StatsCard 
          title="Completed" 
          value={completedInterns} 
          icon={<GraduationCap className="text-orange-500" />} 
          description="Alumni network"
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Department Distribution */}
        <div className="lg:col-span-2 glass-card p-8 rounded-[2rem] border-primary/5 shadow-xl">
          <div className="flex justify-between items-center mb-8">
             <div>
                <h3 className="text-lg font-bold tracking-tight">Departmental Distribution</h3>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">Resource allocation overview</p>
             </div>
             <Briefcase className="w-5 h-5 text-primary/40" />
          </div>
          
          <div className="space-y-6">
            {deptDist.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span>{item.name}</span>
                  <span className="text-primary">{item.count} Interns</span>
                </div>
                <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-1000 ease-out" 
                    style={{ width: `${totalInterns > 0 ? (item.count / totalInterns) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
            {deptDist.length === 0 && (
                <div className="h-32 flex items-center justify-center text-muted-foreground/40 text-[10px] font-black uppercase tracking-widest">
                    No department data available
                </div>
            )}
          </div>
        </div>

        {/* Recent Insights */}
        <div className="glass-card p-8 rounded-[2rem] border-primary/5 shadow-xl bg-primary/5">
             <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                   <h3 className="text-lg font-bold tracking-tight">Recent Activity</h3>
                   <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-0.5">Timeline insights</p>
                </div>
             </div>

             <div className="space-y-6">
                {interns.slice(0, 5).map((intern, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                        <div>
                            <p className="text-xs font-bold leading-none">{intern.user.first_name} joined {intern.user.department?.name || 'InternHub'}</p>
                            <p className="text-[10px] text-muted-foreground mt-1 font-medium italic">
                                {new Date(intern.joining_date).toLocaleDateString()} — {intern.end_date ? new Date(intern.end_date).toLocaleDateString() : 'Present'}
                            </p>
                        </div>
                    </div>
                ))}
                {interns.length === 0 && (
                    <div className="text-muted-foreground/40 text-[10px] font-black uppercase tracking-widest py-8 text-center">
                        No recent activity
                    </div>
                )}
             </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon, description, color }: any) {
    const colorMap: any = {
        blue: "rgba(59, 130, 246, 0.1)",
        emerald: "rgba(16, 185, 129, 0.1)",
        violet: "rgba(139, 92, 246, 0.1)",
        orange: "rgba(249, 115, 22, 0.1)"
    };

    return (
        <div className="glass-card p-6 rounded-[2rem] border-primary/5 shadow-lg group hover:border-primary/20 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full blur-2xl opacity-20 pointer-events-none" style={{ backgroundColor: colorMap[color] }} />
            
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-3 rounded-2xl border border-primary/10 bg-background/50 backdrop-blur-sm group-hover:scale-110 transition-transform duration-500">
                    {icon}
                </div>
                <div className="text-2xl font-black tracking-tighter text-foreground">{value}</div>
            </div>
            
            <div className="relative z-10">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{title}</h4>
                <p className="text-[9px] font-medium text-muted-foreground mt-1 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300">{description}</p>
            </div>
        </div>
    );
}

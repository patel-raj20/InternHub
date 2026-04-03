"use client";

import { useEffect, useState, useMemo } from "react";
import { graphqlService } from "@/lib/services/graphql-service";
import { 
  Building2, 
  Users, 
  Briefcase, 
  Plus,
  LayoutGrid,
  Activity
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";
import { Department } from "@/lib/types";
import { cn } from "@/lib/utils";

const CountUp = ({ value, duration = 0.8 }: { value: number, duration?: number }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    if (end === 0) {
      setCount(0);
      return;
    }
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <>{count.toLocaleString()}</>;
};

export default function DeveloperDashboard() {
  const [stats, setStats] = useState({
    organizations: 0,
    departments: 0,
    interns: 0,
    activeInterns: 0,
  });
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [latestInterns, setLatestInterns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsData, orgs, depts, ints] = await Promise.all([
          graphqlService.getGlobalStats(),
          graphqlService.getOrganizations(),
          graphqlService.getAllDepartments(),
          graphqlService.getInterns(undefined) // Fetch latest interns globally
        ]);
        setStats(statsData);
        setOrganizations(orgs);
        setDepartments(depts);
        setLatestInterns(ints.slice(0, 10)); // Top 10 for activity feed
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast.error("Failed to load platform analytics");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const infraData = useMemo(() => {
    const orgMap: Record<string, { name: string, departments: number, interns: number }> = {};
    
    departments.forEach(dept => {
        const orgId = (dept as any).organization?.id || (dept as any).organization_id;
        const orgName = (dept as any).organization?.name || organizations.find(o => o.id === orgId)?.name || "Unknown";
        if (!orgMap[orgId]) {
            orgMap[orgId] = { name: orgName, departments: 0, interns: 0 };
        }
        orgMap[orgId].departments += 1;
        orgMap[orgId].interns += dept.intern_count || 0;
    });

    return Object.values(orgMap)
        .sort((a, b) => b.interns - a.interns)
        .slice(0, 5);
  }, [departments, organizations]);

  // Global Activity Feed
  const recentActivities = useMemo(() => {
    const events: { text: string; time: Date; color: string; type: string }[] = [];

    // 1. Intern Joinings (from latest 10)
    latestInterns.forEach(intern => {
      events.push({
        text: `${intern.user?.first_name} ${intern.user?.last_name?.[0] || ""}. enrolled in ${intern.user?.department?.name || "the ecosystem"}`,
        time: new Date(intern.created_at || intern.joining_date),
        color: '#10B981',
        type: 'INTERN'
      });
    });

    // 2. Department Creations
    departments.slice(0, 5).forEach(dept => {
      events.push({
        text: `Platform node "${dept.name}" (${(dept as any).organization?.name}) initialized`,
        time: new Date(dept.created_at),
        color: '#7C3AED',
        type: 'DEPT'
      });
    });

    // 3. Organization Creations
    organizations.slice(0, 5).forEach(org => {
      events.push({
        text: `New Partner Organization "${org.name}" onboarded`,
        time: new Date(org.created_at),
        color: 'var(--primary)',
        type: 'ORG'
      });
    });

    return events
        .sort((a, b) => b.time.getTime() - a.time.getTime())
        .slice(0, 10)
        .map(event => ({
            ...event,
            timeLabel: event.time.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        }));
  }, [latestInterns, departments, organizations]);

  const statCards = [
    { label: 'Total Organizations', value: stats.organizations, icon: Building2, color: 'var(--primary)', desc: "Registered organizational entities" },
    { label: 'Global Interns', value: stats.interns, icon: Users, color: '#7C3AED', desc: "Active internship participation" },
    { label: 'Departmental Units', value: stats.departments, icon: Briefcase, color: '#10B981', desc: "Functional departmental nodes" },
    { label: 'Active Sessions', value: stats.activeInterns, icon: Activity, color: '#F59E0B', desc: "Real-time internship sessions" },
  ];

  if (isLoading && stats.organizations === 0) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary shadow-[0_0_20px_rgba(0,122,255,0.3)]"></div>
        </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--primary)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">Ecosystem Telemetry Control</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase">
            Global Core Systems
          </h1>
          <p className="text-muted-foreground font-medium text-sm lg:text-base max-w-xl">
            Real-time telemetry and management control for the global InternHub ecosystem.
          </p>
        </div>
        
        <div className="flex items-center gap-6">
          <Link href="/super-admin/organizations/create">
            <Button className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 neon-glow transition-all hover:scale-105 active:scale-95">
              <Plus size={16} className="mr-2" /> Add New Organization
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <Card key={i} className="relative overflow-hidden border-border/50 group hover:shadow-md transition-shadow">
             <CardContent className="p-6">
                <div className="flex items-start justify-between">
                   <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{stat.label}</span>
                      <h3 className="text-3xl font-black tracking-tighter">
                         <CountUp value={stat.value} />
                      </h3>
                   </div>
                   <div 
                      className="p-3 rounded-xl transition-transform duration-500 group-hover:scale-110"
                      style={{ backgroundColor: `${stat.color}10`, border: `1px solid ${stat.color}20` }}
                   >
                      <stat.icon size={20} style={{ color: stat.color }} />
                   </div>
                </div>
             </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom Grid: Infrastructure & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mt-8">
        
        {/* Left: Infrastructure Chart (65%) */}
        <div className="lg:col-span-8">
          <Card className="glass-card border-border/40 rounded-[2.5rem] overflow-hidden shadow-2xl relative group h-full">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
            <CardHeader className="p-10 pb-0">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-inner">
                    <LayoutGrid className="w-6 h-6 text-primary neon-glow" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-black tracking-tighter uppercase flex gap-4 items-baseline text-foreground">
                      <span>Infrastructure</span>
                      <span className="text-primary font-light">Dynamics</span>
                    </CardTitle>
                    <p className="text-[10px] text-primary/40 font-black uppercase tracking-[0.3em] mt-1 italic">Scale distribution per partner organization</p>
                  </div>
                </div>
            </CardHeader>
            <CardContent className="p-10 pt-6">
              <div className="h-[400px] w-full mt-8 relative">
                  <div className="absolute top-0 right-0 flex flex-col gap-2 z-10">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-[9px] font-black uppercase text-foreground/70 tracking-widest">Departments</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#7C3AED]" />
                        <span className="text-[9px] font-black uppercase text-foreground/70 tracking-widest">Interns</span>
                    </div>
                  </div>

                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={infraData} margin={{ left: -20, bottom: 20 }}>
                      <defs>
                          <linearGradient id="barGradientPrimary" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#007aff" stopOpacity={1} />
                            <stop offset="100%" stopColor="#007aff" stopOpacity={0.6} />
                          </linearGradient>
                          <linearGradient id="barGradientSecondary" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#7C3AED" stopOpacity={1} />
                            <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.6} />
                          </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.2} />
                      <XAxis 
                          dataKey="name" 
                          stroke="currentColor" 
                          className="text-foreground/40"
                          fontSize={10} 
                          fontWeight="black"
                          tickLine={false} 
                          axisLine={false} 
                          tickFormatter={(val) => val.length > 12 ? `${val.slice(0, 12)}..` : val.toUpperCase()} 
                          dy={15}
                      />
                      <YAxis 
                          yAxisId="left" 
                          orientation="left" 
                          stroke="#007aff" 
                          fontSize={10} 
                          fontWeight="black" 
                          tickLine={false} 
                          axisLine={false} 
                          opacity={0.8}
                      />
                      <YAxis 
                          yAxisId="right" 
                          orientation="right" 
                          stroke="#7C3AED" 
                          fontSize={10} 
                          fontWeight="black" 
                          tickLine={false} 
                          axisLine={false} 
                          opacity={0.8}
                      />
                      <Tooltip 
                          cursor={{ fill: 'var(--primary)', opacity: 0.05 }}
                          contentStyle={{ 
                            backgroundColor: '#0f172a', 
                            backdropFilter: 'blur(12px)',
                            borderRadius: '16px', 
                            border: '1px solid rgba(255,255,255,0.1)', 
                            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                            fontSize: '11px',
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            color: '#fff',
                          }} 
                      />
                      <Bar yAxisId="left" dataKey="departments" fill="url(#barGradientPrimary)" radius={[8, 8, 0, 0]} barSize={24} name="Departments" />
                      <Bar yAxisId="right" dataKey="interns" fill="url(#barGradientSecondary)" radius={[8, 8, 0, 0]} barSize={24} name="Interns" />
                    </BarChart>
                  </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Global Activity Feed (35%) */}
        <div className="lg:col-span-4">
          <Card className="glass-card border-border/40 rounded-[2.5rem] overflow-hidden shadow-2xl h-full flex flex-col">
            <CardHeader className="p-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div>
                   <CardTitle className="text-xl font-black tracking-tight uppercase text-foreground">Global Lifecycle</CardTitle>
                   <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1 opacity-60">Real-time platform events</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8 flex-grow">
              <div className="max-h-[500px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                {recentActivities.length > 0 ? recentActivities.map((act, i) => (
                  <div key={i} className="flex gap-4 group transition-all duration-300">
                     <div className="flex flex-col items-center gap-1 mt-1.5">
                        <div 
                          className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)] group-hover:scale-125 transition-transform" 
                          style={{ backgroundColor: act.color, boxShadow: `0 0 8px ${act.color}40` }} 
                        />
                        {i !== recentActivities.length - 1 && <div className="w-px flex-1 bg-border/40 min-h-[48px]" />}
                     </div>
                     <div className="pb-6 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            "text-[8px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-md border",
                            act.type === 'INTERN' ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500" :
                            act.type === 'DEPT' ? "bg-purple-500/5 border-purple-500/20 text-purple-500" :
                            "bg-primary/5 border-primary/20 text-primary"
                          )}>
                            {act.type}
                          </span>
                          <span className="text-[9px] text-muted-foreground/50 font-bold uppercase tracking-wider">{act.timeLabel}</span>
                        </div>
                        <p className="text-[11px] font-bold text-foreground/80 leading-relaxed group-hover:text-foreground transition-colors pr-2">
                           {act.text}
                        </p>
                     </div>
                  </div>
                )) : (
                  <div className="h-full flex items-center justify-center py-20 opacity-20 flex-col gap-2">
                    <Activity size={32} />
                    <p className="text-[10px] font-black uppercase tracking-widest">Awaiting events...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

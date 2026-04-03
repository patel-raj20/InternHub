"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  AreaChart, Area, ResponsiveContainer 
} from 'recharts';
import { 
  Building2, LayoutGrid, Users, Activity, Search, 
  ExternalLink, PlusCircle, TrendingUp, ChevronLeft, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { graphqlService } from "@/lib/services/graphql-service";
import { Organization, Department, Intern } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import DepartmentStatusExplorer from "./DepartmentStatusExplorer";
import DepartmentPerformanceLeaderboard from "./DepartmentPerformanceLeaderboard";

// --- Utility: cn ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Sub-Components ---

const CountUp = ({ value, duration = 0.8 }: { value: number, duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
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

// --- Main Dashboard Component ---

import { useSelector } from 'react-redux';
import { RootState } from "@/store";

export default function SuperAdminDashboard() {
  const { role, organization_id } = useSelector((state: RootState) => state.user);
  
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [interns, setInterns] = useState<Intern[]>([]);
  const [stats, setStats] = useState({ organizations: 0, departments: 0, interns: 0, activeInterns: 0, completedInterns: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (role === "DEVELOPER") {
          const [orgs, depts, ints, globalStats] = await Promise.all([
            graphqlService.getOrganizations(),
            graphqlService.getAllDepartments(),
            graphqlService.getInterns(undefined),
            graphqlService.getGlobalStats()
          ]);
          setOrganizations(orgs);
          setDepartments(depts);
          setInterns(ints);
          setStats({
            ...globalStats,
            completedInterns: ints.filter(i => (i as any).user?.status?.toLowerCase() === 'completed').length
          });
        } else if (role === "SUPER_ADMIN" && organization_id) {
          const [org, depts, ints] = await Promise.all([
            graphqlService.getOrganizationById(organization_id),
            graphqlService.getDepartments(organization_id),
            graphqlService.getInterns(organization_id)
          ]);
          setOrganizations([org]);
          setDepartments(depts);
          setInterns(ints);
          // Calculate stats for Super Admin
          setStats({
            organizations: 1,
            departments: depts.length,
            interns: ints.length,
            activeInterns: ints.filter(i => (i as any).user?.status?.toLowerCase() === 'active').length,
            completedInterns: ints.filter(i => (i as any).user?.status?.toLowerCase() === 'completed').length
          });
        }
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
        toast.error("Failed to load real-time analytics");
      } finally {
        setIsLoading(false);
      }
    };
    if (role) fetchData();
  }, [role, organization_id]);

  // Filtered Table Data
  const filteredOrgs = useMemo(() => {
    return organizations.filter(org => 
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.industry?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [organizations, searchQuery]);

  const totalPages = Math.ceil(filteredOrgs.length / rowsPerPage);
  const paginatedOrgs = filteredOrgs.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const isDev = role === "DEVELOPER";
  const orgName = organizations[0]?.name || "Your Organization";

  // Derived Activity Feed - Merged with all telemetry streams
  const recentActivities = useMemo(() => {
    const events: { text: string; time: Date; color: string; type: string }[] = [];

    // 1. Intern Joinings
    interns.forEach(intern => {
      events.push({
        text: `${intern.user?.first_name} ${intern.user?.last_name?.[0] || ""}. enrolled in ${intern.user?.department?.name || "a department"}`,
        time: new Date(intern.created_at || intern.joining_date),
        color: '#10B981', // Emerald for growth
        type: 'INTERN'
      });
    });

    // 2. Department Creations
    departments.forEach(dept => {
      events.push({
        text: `New Department "${dept.name}" was successfully deployed`,
        time: new Date(dept.created_at),
        color: '#7C3AED', // Purple for infra
        type: 'DEPT'
      });
    });

    // 3. Organization Creations (Global View only)
    if (isDev) {
      organizations.forEach(org => {
        events.push({
          text: `Partner "${org.name}" joined the global ecosystem`,
          time: new Date(org.created_at),
          color: 'var(--primary)', // Blue for partner
          type: 'ORG'
        });
      });
    }

    return events
        .sort((a, b) => b.time.getTime() - a.time.getTime())
        .slice(0, 10) // Show top 10 live events
        .map(event => ({
            ...event,
            timeLabel: event.time.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        }));
  }, [interns, departments, organizations, isDev]);

  const kpiConfig = [
    { label: 'Total Departments', value: stats.departments, icon: LayoutGrid, color: '#7C3AED' },
    { label: 'Total Interns', value: stats.interns, icon: Users, color: '#10B981' },
    { label: 'Active Interns', value: stats.activeInterns, icon: Activity, color: '#F59E0B' },
    { label: 'Completed Interns', value: stats.completedInterns, icon: TrendingUp, color: '#00D4FF' },
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
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">
                {isDev ? "Global Core Systems" : "Departmental Overview"}
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter leading-none uppercase">
              {isDev ? "System Infrastructure" : `${orgName}`}
            </h1>
            <p className="text-muted-foreground font-medium text-sm lg:text-base max-w-xl">
              {isDev 
                ? "Monitoring global ecosystem growth and partner performance metrics." 
                : "Real-time control center for organization departments and intern operations."}
            </p>
          </div>
          
          {isDev && (
            <Link href="/super-admin/organizations/create">
              <Button className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg neon-glow scale-105 hover:scale-110 active:scale-95 transition-all">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Organization
              </Button>
            </Link>
          )}
        </div>

       {/* 1. TOP KPI BAR */}
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiConfig.map((kpi, idx) => (
            <Card key={idx} className="relative overflow-hidden border-border/50 group hover:shadow-md transition-shadow">
               <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                     <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{kpi.label}</span>
                        <h3 className="text-3xl font-black tracking-tighter">
                           <CountUp value={kpi.value} />
                        </h3>
                     </div>
                     <div 
                       className="p-3 rounded-xl transition-transform duration-500 group-hover:scale-110"
                       style={{ backgroundColor: `${kpi.color}10`, border: `1px solid ${kpi.color}20` }}
                     >
                        <kpi.icon size={20} style={{ color: kpi.color }} />
                     </div>
                  </div>
               </CardContent>
            </Card>
          ))}
       </div>

       {/* 2. MAIN GRID (LEFT: 50% | RIGHT: 50%) - Status Explorer & Recent Activity */}
       <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch mt-8">
           
           {/* LEFT COLUMN (50%) - Status Explorer */}
          <div>
             
             {/* A. Department Status Explorer */}
             <DepartmentStatusExplorer />
          </div>

          {/* RIGHT COLUMN (50%) - Recent Activity */}
          <div>
             
             {/* B. Recent Activity Feed */}
             <Card className="border-border/50 h-full flex flex-col">
                <CardHeader>
                   <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" />
                      Recent Activity
                   </CardTitle>
                   <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Live platform events</p>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="max-h-[500px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                      {recentActivities.map((act, i) => (
                        <div key={i} className="flex gap-4 group transition-all duration-300">
                           <div className="flex flex-col items-center gap-1 mt-1.5">
                              <div 
                                className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)] group-hover:scale-125 transition-transform" 
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
                                <span className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-wider">{act.timeLabel}</span>
                              </div>
                              <p className="text-[11px] font-bold text-foreground/80 leading-relaxed group-hover:text-foreground transition-colors pr-4">
                                 {act.text}
                              </p>
                           </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
             </Card>
          </div>
       </div>

       {/* 3. PERFORMANCE ANALYTICS (Below the 50-50 grid) */}
       <div className="mt-8">
          <DepartmentPerformanceLeaderboard 
            departments={departments} 
            interns={interns} 
          />
       </div>

       {/* 4. ORGANIZATION TABLE (Developer Only) */}
       {isDev && (
         <div className="mt-8">
           <Card className="border-border/50 overflow-hidden shadow-xl glass-card">
              <CardHeader className="flex flex-row items-center justify-between p-8">
                 <div>
                    <CardTitle className="text-xl font-black tracking-tight uppercase">Partner Organizations</CardTitle>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1 opacity-60">Global ecosystem management</p>
                 </div>
                 <div className="relative w-full sm:w-64">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                    <input 
                      type="text" 
                      placeholder="Search organizations..."
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                      className="w-full bg-background/50 backdrop-blur-md border border-border/50 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium"
                    />
                 </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                      <thead className="bg-muted/30 border-y border-border/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                         <tr>
                            <th className="px-8 py-5">Org Name</th>
                            <th className="px-6 py-5">Industry</th>
                            <th className="px-6 py-5">Registered On</th>
                            <th className="px-8 py-5 text-right">Actions</th>
                         </tr>
                      </thead>
                      <tbody>
                         {paginatedOrgs.map((org, i) => (
                           <tr key={i} className="group border-b border-border/10 hover:bg-primary/[0.02] transition-colors text-[11px] font-bold">
                              <td className="px-8 py-4">
                                 <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner group-hover:scale-105 transition-transform">
                                       <Building2 size={16} className="text-primary" />
                                    </div>
                                    <span className="text-sm font-black tracking-tight">{org.name}</span>
                                 </div>
                              </td>
                              <td className="px-6 py-4">
                                 <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-muted/50 border border-border/50 text-muted-foreground/60 uppercase tracking-widest">
                                    {org.industry || "N/A"}
                                 </span>
                              </td>
                              <td className="px-6 py-4 text-xs font-mono text-muted-foreground/40 italic">{new Date(org.created_at).toLocaleDateString()}</td>
                              <td className="px-8 py-4 text-right">
                                 <Link href={`/super-admin/organizations/${org.id}`}>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all border-none">
                                       <ExternalLink size={16} />
                                    </Button>
                                 </Link>
                              </td>
                           </tr>
                         ))}
                         {paginatedOrgs.length === 0 && (
                             <tr>
                                <td colSpan={4} className="px-8 py-24 text-center">
                                   <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-20">No organizations matching telemetry</p>
                                </td>
                             </tr>
                         )}
                      </tbody>
                   </table>
                </div>

                <div className="px-8 py-4 bg-muted/10 flex justify-between items-center border-t border-border/50">
                   <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
                      LOG: {filteredOrgs.length > 0 ? (currentPage-1)*rowsPerPage + 1 : 0} – {Math.min(currentPage*rowsPerPage, filteredOrgs.length)} OF {filteredOrgs.length} ENTRIES
                   </span>
                   <div className="flex items-center gap-2">
                      <Button 
                         variant="outline" size="icon" className="h-8 w-8 rounded-lg border-border/50"
                         onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                         disabled={currentPage === 1}
                      >
                         <ChevronLeft size={16} />
                      </Button>
                      <Button 
                         variant="outline" size="icon" className="h-8 w-8 rounded-lg border-border/50"
                         onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                         disabled={currentPage === totalPages || totalPages === 0}
                      >
                         <ChevronRight size={16} />
                      </Button>
                   </div>
                </div>
              </CardContent>
           </Card>
         </div>
       )}

    </div>
  );
}

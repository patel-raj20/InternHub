"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area 
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

export default function SuperAdminDashboard() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [interns, setInterns] = useState<Intern[]>([]);
  const [stats, setStats] = useState({ organizations: 0, departments: 0, interns: 0, activeInterns: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [orgs, depts, ints, globalStats] = await Promise.all([
          graphqlService.getOrganizations(),
          graphqlService.getAllDepartments(),
          graphqlService.getInterns(undefined), // Fixed: pass undefined instead of "" to avoid UUID error
          graphqlService.getGlobalStats()
        ]);
        setOrganizations(orgs);
        setDepartments(depts);
        setInterns(ints);
        setStats(globalStats);
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
        toast.error("Failed to load real-time analytics");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filtered Table Data
  const filteredOrgs = useMemo(() => {
    return organizations.filter(org => 
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.industry?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [organizations, searchQuery]);

  const totalPages = Math.ceil(filteredOrgs.length / rowsPerPage);
  const paginatedOrgs = filteredOrgs.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // Derived Chart Data: Infrastructure
  const infraData = useMemo(() => {
    const orgMap: Record<string, { name: string, departments: number, interns: number }> = {};
    
    departments.forEach(dept => {
        const orgId = (dept as any).organization?.id;
        const orgName = (dept as any).organization?.name || "Unknown";
        if (!orgMap[orgId]) {
            orgMap[orgId] = { name: orgName, departments: 0, interns: 0 };
        }
        orgMap[orgId].departments += 1;
        orgMap[orgId].interns += dept.intern_count || 0;
    });

    return Object.values(orgMap)
        .sort((a, b) => b.interns - a.interns)
        .slice(0, 5);
  }, [departments]);

  // Derived Activity Feed
  const recentActivities = useMemo(() => {
    return interns
        .slice(0, 6)
        .map(intern => ({
            text: `${intern.user?.first_name} ${intern.user?.last_name?.[0]}. joined ${intern.user?.department?.name || 'a department'}`,
            time: new Date(intern.created_at || intern.joining_date).toLocaleDateString(),
            color: 'var(--primary)'
        }));
  }, [interns]);

  const kpiConfig = [
    { label: 'Total Organizations', value: stats.organizations, icon: Building2, color: 'var(--primary)' },
    { label: 'Total Departments', value: stats.departments, icon: LayoutGrid, color: '#7C3AED' },
    { label: 'Total Interns', value: stats.interns, icon: Users, color: '#10B981' },
    { label: 'Active Interns', value: stats.activeInterns, icon: Activity, color: '#F59E0B' },
  ];

  if (isLoading && stats.organizations === 0) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 space-y-10 animate-in fade-in duration-700">
       
       {/* Header Section */}
       <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-primary neon-glow" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">Global System Overview</span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter leading-none">Super Admin Dashboard</h1>
            <p className="text-muted-foreground font-medium">Monitoring global growth and infrastructure metrics.</p>
          </div>
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

       {/* 2. MAIN GRID (LEFT: 65% | RIGHT: 35%) */}
       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
           {/* LEFT COLUMN (65%) */}
          <div className="lg:col-span-8 space-y-8">
             
             {/* A. Department Status Explorer */}
             <DepartmentStatusExplorer />

             {/* B. Organization Table */}
             <Card className="border-border/50 overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between">
                   <div>
                      <CardTitle className="text-xl font-black tracking-tight">Partner Organizations</CardTitle>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Global ecosystem management</p>
                   </div>
                   <div className="relative w-full sm:w-64">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                      <input 
                        type="text" 
                        placeholder="Search organizations..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        className="w-full bg-muted/50 border border-border/50 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium"
                      />
                   </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse">
                        <thead className="bg-muted/30 border-y border-border/50">
                           <tr>
                              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Org Name</th>
                              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Industry</th>
                              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Registered On</th>
                              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                           </tr>
                        </thead>
                        <tbody>
                           {paginatedOrgs.map((org, i) => (
                             <tr key={i} className="group border-b border-border/50 hover:bg-muted/20 transition-colors">
                                <td className="px-6 py-4">
                                   <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                                         <Building2 size={14} className="text-primary" />
                                      </div>
                                      <span className="text-sm font-bold">{org.name}</span>
                                   </div>
                                </td>
                                <td className="px-6 py-4">
                                   <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted border border-border/50 text-muted-foreground uppercase tracking-wider text-[9px]">
                                      {org.industry || "N/A"}
                                   </span>
                                </td>
                                <td className="px-6 py-4 text-xs font-semibold text-muted-foreground">{new Date(org.created_at).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-right">
                                   <Link href={`/super-admin/organizations/${org.id}`}>
                                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary hover:text-primary-foreground transition-all">
                                         <ExternalLink size={14} />
                                      </Button>
                                   </Link>
                                </td>
                             </tr>
                           ))}
                           {paginatedOrgs.length === 0 && (
                              <tr>
                                 <td colSpan={4} className="px-8 py-20 text-center">
                                    <p className="text-xs font-black uppercase tracking-widest opacity-20">No organizations found</p>
                                 </td>
                              </tr>
                           )}
                        </tbody>
                     </table>
                  </div>

                  <div className="px-6 py-4 bg-muted/10 flex justify-between items-center border-t border-border/50">
                     <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                        {filteredOrgs.length > 0 ? (currentPage-1)*rowsPerPage + 1 : 0}–{Math.min(currentPage*rowsPerPage, filteredOrgs.length)} of {filteredOrgs.length}
                     </span>
                     <div className="flex items-center gap-2">
                        <Button 
                           variant="outline" size="icon" className="h-8 w-8 rounded-lg"
                           onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                           disabled={currentPage === 1}
                        >
                           <ChevronLeft size={16} />
                        </Button>
                        <Button 
                           variant="outline" size="icon" className="h-8 w-8 rounded-lg"
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

          {/* RIGHT COLUMN (35%) */}
          <div className="lg:col-span-4 space-y-8">
             
             {/* C. Infrastructure Chart */}
             <Card className="border-border/50">
                <CardHeader>
                   <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                      <LayoutGrid className="w-5 h-5 text-primary" />
                      Infrastructure
                   </CardTitle>
                   <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Scale per partner organization</p>
                </CardHeader>
                <CardContent>
                  <div className="h-[240px] w-full mt-4">
                     <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={infraData} margin={{ left: -30 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
                          <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(val) => val.length > 8 ? `${val.slice(0, 8)}..` : val} />
                          <YAxis yAxisId="left" orientation="left" stroke="var(--primary)" fontSize={9} fontWeight="bold" tickLine={false} axisLine={false} />
                          <YAxis yAxisId="right" orientation="right" stroke="#7C3AED" fontSize={9} fontWeight="bold" tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', fontSize: '11px' }} />
                          <Bar yAxisId="left" dataKey="departments" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={12} name="Depts" />
                          <Bar yAxisId="right" dataKey="interns" fill="#7C3AED" radius={[4, 4, 0, 0]} barSize={12} name="Interns" />
                       </BarChart>
                     </ResponsiveContainer>
                  </div>
                </CardContent>
             </Card>

             {/* D. Recent Activity Feed */}
             <Card className="border-border/50">
                <CardHeader>
                   <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" />
                      Recent Activity
                   </CardTitle>
                   <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Live platform events</p>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[300px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                     {recentActivities.map((act, i) => (
                       <div key={i} className="flex gap-4 group transition-all duration-300">
                          <div className="flex flex-col items-center gap-1 mt-1.5">
                             <div className="w-2.5 h-2.5 rounded-full bg-primary/40 shadow-sm" style={{ backgroundColor: act.color }} />
                             {i !== recentActivities.length - 1 && <div className="w-px flex-1 bg-border/50 min-h-[40px]" />}
                          </div>
                          <div className="pb-4 flex-1">
                             <p className="text-[11px] font-bold text-foreground/80 leading-relaxed group-hover:text-foreground transition-colors">
                                {act.text}
                             </p>
                             <span className="text-[10px] text-muted-foreground/60 mt-1 block font-medium uppercase tracking-wider italic">{act.time}</span>
                          </div>
                       </div>
                     ))}
                  </div>
                </CardContent>
             </Card>

          </div>
       </div>

    </div>
  );
}

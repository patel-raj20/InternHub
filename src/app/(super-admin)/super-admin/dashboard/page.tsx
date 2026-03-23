"use client";

import { GlobalStatsCards } from "@/components/interns/global-stats-cards";
import { InternTable } from "@/components/interns/intern-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, UserPlus, ShieldCheck, Building2 } from "lucide-react";
import Link from "next/link";
import { GrowthChart } from "@/components/charts/growth-chart";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getInterns } from "@/lib/api/interns";
import { getDepartments } from "@/lib/api/departments";
import { Intern, Department } from "@/lib/types";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export default function SuperAdminDashboardPage() {
  const [interns, setInterns] = useState<Intern[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const iData = await getInterns();
        const dData = await getDepartments();
        setInterns(iData);
        setDepartments(dData);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);
  
  const activeInterns = interns.filter(i => i.status === 'ACTIVE').length;
  const recentInterns = interns.slice(0, 5);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto py-10 px-6"
    >
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-primary neon-glow" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">System Management</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter leading-none">Super Admin</h1>
          <p className="text-muted-foreground font-medium">Global control center for the InternHub ecosystem.</p>
        </div>
        <Link href="/super-admin/create-intern">
          <Button className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg neon-glow scale-105 hover:scale-110 active:scale-95 transition-all">
            <UserPlus className="w-4 h-4 mr-2" /> Add New Intern
          </Button>
        </Link>
      </motion.div>

      <motion.div variants={item}>
        <GlobalStatsCards 
          totalInterns={interns.length} 
          totalDepartments={departments.length} 
          activeInterns={activeInterns} 
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        <motion.div variants={item} className="lg:col-span-8">
          <GrowthChart />
        </motion.div>
        
        <motion.div variants={item} className="lg:col-span-4">
          <Card className="h-full border-border/50 glass-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Departments</CardTitle>
                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                  <Building2 size={16} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 mt-4">
              {departments.map((dept) => (
                <div 
                  key={dept.depart_id} 
                  className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-border/50 hover:border-primary/30 transition-all group cursor-pointer"
                >
                  <div className="font-black text-sm tracking-tight">{dept.name}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-primary">{dept.count}</span>
                    <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Interns</span>
                  </div>
                </div>
              ))}
              <Link href="/super-admin/departments" className="block w-full pt-2">
                <Button variant="outline" className="w-full h-11 rounded-xl font-black uppercase tracking-widest text-[10px] border-border/50 hover:bg-muted transition-all">
                  Manage All Departments
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={item} className="glass-card rounded-2xl border-border/50 overflow-hidden shadow-2xl">
        <div className="p-8 pb-4 flex justify-between items-center border-b border-border/50">
          <div>
            <h2 className="text-xl font-black tracking-tight">Recent Activity</h2>
            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-1">Cross-department updates</p>
          </div>
          <Link href="/super-admin/interns">
            <Button variant="outline" size="sm" className="h-10 px-4 rounded-xl font-bold gap-2 hover:bg-muted transition-all">
              View All <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        <div className="p-0">
          <InternTable data={recentInterns} mode="SUPER_ADMIN" isLoading={isLoading} />
        </div>
      </motion.div>
    </motion.div>
  );
}

"use client";

import { DeptStatsCards } from "@/components/interns/dept-stats-cards";
import { InternTable } from "@/components/interns/intern-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, UserPlus, Building2 } from "lucide-react";
import Link from "next/link";
import { GrowthChart } from "@/components/charts/growth-chart";
import { DepartmentInfoCard } from "@/components/interns/department-info-card";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getInterns } from "@/lib/api/interns";
import { Intern } from "@/lib/types";

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

export default function DeptAdminDashboardPage() {
  const [interns, setInterns] = useState<Intern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchInterns = async () => {
      try {
        // Mocking the current admin's department as 'dept1' (Computer Science)
        const data = await getInterns('dept1');
        setInterns(data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInterns();
  }, []);
  
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
            <Building2 className="w-4 h-4 text-primary neon-glow" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">Department Workspace</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter leading-none">Computer Science</h1>
          <p className="text-muted-foreground font-medium">Manage your department's interns and performance.</p>
        </div>
        <Link href="/admin/create-intern">
          <Button className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg neon-glow scale-105 hover:scale-110 active:scale-95 transition-all">
            <UserPlus className="w-4 h-4 mr-2" /> Add Intern
          </Button>
        </Link>
      </motion.div>

      <motion.div variants={item}>
        <DeptStatsCards 
          total={interns.length} 
          active={interns.filter(i => i.status === 'ACTIVE').length} 
          completed={interns.filter(i => i.status === 'COMPLETED').length} 
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        <motion.div variants={item} className="lg:col-span-8">
          <GrowthChart />
        </motion.div>
        
        <motion.div variants={item} className="lg:col-span-4">
          <DepartmentInfoCard name="Computer Science" totalInterns={interns.length} />
        </motion.div>
      </div>

      <motion.div variants={item} className="glass-card rounded-2xl border-border/50 overflow-hidden shadow-2xl">
        <div className="p-8 pb-4 flex justify-between items-center border-b border-border/50">
          <div>
            <h2 className="text-xl font-black tracking-tight">Department Interns</h2>
            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-1">Recent enrollments</p>
          </div>
          <Link href="/admin/interns">
            <Button variant="outline" size="sm" className="h-10 px-4 rounded-xl font-bold gap-2 hover:bg-muted transition-all">
              View All <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        <div className="p-0">
          <InternTable data={recentInterns} mode="ADMIN" isLoading={isLoading} />
        </div>
      </motion.div>
    </motion.div>
  );
}

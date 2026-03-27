"use client";

import { DeptStatsCards } from "@/components/interns/dept-stats-cards";
import { InternTable } from "@/components/interns/intern-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, UserPlus, Building2 } from "lucide-react";
import Link from "next/link";
import { GrowthChart } from "@/components/charts/growth-chart";
import { JoinTrendChart } from "@/components/charts/join-trend-chart";
import { TopCollegesChart } from "@/components/charts/top-colleges-chart";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { graphqlService } from "@/lib/services/graphql-service";
import { Intern } from "@/lib/types";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import toast from "react-hot-toast";

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
  const [deptName, setDeptName] = useState<string>("Department");
  const [isLoading, setIsLoading] = useState(true);
  
  const { organization_id, department_id } = useSelector((state: RootState) => state.user);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!organization_id || !department_id) return;
      
      setIsLoading(true);
      try {
        const [iData, dData] = await Promise.all([
          graphqlService.getInterns(organization_id, department_id),
          graphqlService.getDepartments(organization_id)
        ]);
        setInterns(iData);
        const currentDept = dData.find(d => d.id === department_id);
        if (currentDept) setDeptName(currentDept.name);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load department dashboard");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [organization_id, department_id]);
  
  const recentInterns = interns.slice(0, 5);

  const growthData = Object.values(
    interns.reduce((acc: any, intern) => {
      const date = new Date(intern.joining_date);
      const monthYear = date.toLocaleString('default', { month: 'short' });
      if (!acc[monthYear]) {
        acc[monthYear] = { name: monthYear, total: 0, sortKey: date.getTime() };
      }
      acc[monthYear].total += 1;
      return acc;
    }, {})
  ).sort((a: any, b: any) => a.sortKey - b.sortKey)
   .map(({ name, total }: any) => ({ name, total }));

  const collegeData = Object.values(
    interns.reduce((acc: any, intern) => {
      const college = intern.college_name || "Unknown Institution";
      if (!acc[college]) {
        acc[college] = { name: college, total: 0 };
      }
      acc[college].total += 1;
      return acc;
    }, {})
  ).sort((a: any, b: any) => b.total - a.total);

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
          <h1 className="text-4xl font-black tracking-tighter leading-none">{deptName}</h1>
          <p className="text-muted-foreground font-medium">Manage your department's interns and performance.</p>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <DeptStatsCards 
          total={interns.length} 
          active={interns.filter(i => i.user.status === 'ACTIVE').length} 
          completed={interns.filter(i => i.user.status === 'COMPLETED').length} 
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        <motion.div variants={item} className="lg:col-span-8">
          <JoinTrendChart data={growthData} />
        </motion.div>
        
        <motion.div variants={item} className="lg:col-span-4">
          <TopCollegesChart data={collegeData as any} />
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

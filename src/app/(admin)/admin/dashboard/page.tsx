"use client";

import { DeptStatsCards } from "@/components/interns/dept-stats-cards";
import { Building2 } from "lucide-react";
import { JoinTrendChart } from "@/components/charts/join-trend-chart";
import { TopCollegesChart } from "@/components/charts/top-colleges-chart";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { graphqlService } from "@/lib/services/graphql-service";
import { Intern } from "@/lib/types";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import toast from "react-hot-toast";

// New Chart Components
import { TaskVelocityChart } from "@/components/charts/task-velocity-chart";
import { TaskStatusDonut } from "@/components/charts/task-status-donut";
import { TopInternsBar } from "@/components/charts/top-interns-bar";

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
  
  // New Chart States
  const [velocityData, setVelocityData] = useState<{date: string, completed: number}[]>([]);
  const [statusData, setStatusData] = useState<{name: string, value: number, color: string}[]>([]);
  const [topInterns, setTopInterns] = useState<{name: string, score: number}[]>([]);
  
  const { organization_id, department_id } = useSelector((state: RootState) => state.user);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!organization_id || !department_id) return;
      
      setIsLoading(true);
      try {
        const [iData, dData, tasks, leaderboard] = await Promise.all([
          graphqlService.getInterns(organization_id, department_id),
          graphqlService.getDepartments(organization_id),
          graphqlService.getAllTasks({ intern: { user: { department_id: { _eq: department_id } } } }),
          graphqlService.getLeaderboard(department_id, 5)
        ]);
        
        setInterns(iData);
        const currentDept = dData.find(d => d.id === department_id);
        if (currentDept) setDeptName(currentDept.name);

        // Process Task Velocity Data (Last 30 days)
        const dateMap: Record<string, number> = {};
        const today = new Date();
        for(let i=29; i>=0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            dateMap[dateStr] = 0;
        }

        let doneCount = 0;
        let pendingCount = 0;
        let overdueCount = 0;

        tasks.forEach((task: any) => {
            if (task.status === "completed") {
                doneCount++;
                if (task.completed_at) {
                    const compDate = new Date(task.completed_at);
                    const ds = compDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    if (dateMap[ds] !== undefined) {
                        dateMap[ds]++;
                    }
                }
            } else {
                const deadlineDate = task.deadline ? new Date(task.deadline).getTime() : Infinity;
                if (deadlineDate < today.getTime()) overdueCount++;
                else pendingCount++;
            }
        });

        setVelocityData(Object.entries(dateMap).map(([date, completed]) => ({ date, completed })));
        
        setStatusData([
            { name: "Completed", value: doneCount, color: "#1d4ed8" },
            { name: "In Progress", value: pendingCount, color: "#3b82f6" },
            { name: "Overdue", value: overdueCount, color: "#93c5fd" },
        ]);

        setTopInterns(leaderboard.map((intern: any) => ({
            name: `${intern.user.first_name} ${intern.user.last_name || ''}`.trim(),
            score: intern.total_points || 0
        })));

      } catch (error) {
        console.error(error);
        toast.error("Failed to load department dashboard");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [organization_id, department_id]);

  // Legacy Data Processing
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
      className="max-w-[1600px] w-full mx-auto py-10 px-6 xl:px-12 flex flex-col min-h-screen space-y-8"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-primary drop-shadow-[0_0_8px_rgba(0,122,255,0.8)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">Department Workspace</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter leading-none">{deptName} Dashboard</h1>
          <p className="text-muted-foreground font-medium text-sm mt-2">Comprehensive overview of intern tasks, productivity, and ranking.</p>
        </div>
      </motion.div>

      {/* Legacy Stats Row */}
      <motion.div variants={item}>
        <DeptStatsCards 
          total={interns.length} 
          active={interns.filter(i => i.user.status === 'ACTIVE').length} 
          completed={interns.filter(i => i.user.status === 'COMPLETED').length} 
        />
      </motion.div>

      {/* Legacy Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <motion.div variants={item} className="lg:col-span-8">
          <JoinTrendChart data={growthData} />
        </motion.div>
        
        <motion.div variants={item} className="lg:col-span-4">
          <TopCollegesChart data={collegeData as any} />
        </motion.div>
      </div>

      {/* NEW Task Analytics Middle Row */}
      <motion.div variants={item} className="w-full h-auto">
         <TaskVelocityChart data={velocityData} />
      </motion.div>

      {/* NEW Task Analytics Bottom Split Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[400px] shrink-0">
         <motion.div variants={item} className="w-full h-full">
            <TaskStatusDonut data={statusData} />
         </motion.div>
         <motion.div variants={item} className="w-full h-full">
            <TopInternsBar data={topInterns} />
         </motion.div>
      </div>


    </motion.div>
  );
}

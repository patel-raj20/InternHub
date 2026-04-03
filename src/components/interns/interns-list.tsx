"use client";

import { useState, useMemo, useEffect } from "react";
import { Intern, Department } from "@/lib/types";
import { InternTable } from "@/components/interns/intern-table";
import { SearchBar } from "@/components/interns/search-bar";
import { FilterBar } from "@/components/interns/filter-bar";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { graphqlService } from "@/lib/services/graphql-service";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import toast from "react-hot-toast";
import { StatCard } from "@/components/ui/stat-card";
import { Users, Activity, Target, Zap } from "lucide-react";

interface InternsListProps {
  mode: "ADMIN" | "SUPER_ADMIN";
  variant?: "management" | "report";
}

export function InternsList({ mode, variant = "management" }: InternsListProps) {
  const [interns, setInterns] = useState<Intern[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [dept, setDept] = useState("ALL");
  const [degree, setDegree] = useState("ALL");
  const [college, setCollege] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { organization_id, department_id } = useSelector((state: RootState) => state.user);
  const targetDeptId = mode === "ADMIN" ? department_id : undefined;

  useEffect(() => {
    const loadData = async () => {
      if (!organization_id) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const [internData, deptData] = await Promise.all([
          graphqlService.getInterns(organization_id as string, targetDeptId || undefined),
          graphqlService.getDepartments(organization_id as string)
        ]);
        setInterns(internData);
        setDepartments(deptData);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load interns list");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [organization_id, targetDeptId]);

  const uniqueDegrees = useMemo(() => {
    return Array.from(new Set(interns.map(i => i.degree).filter(Boolean))) as string[];
  }, [interns]);

  const uniqueColleges = useMemo(() => {
    return Array.from(new Set(interns.map(i => i.college_name).filter(Boolean))) as string[];
  }, [interns]);

  const filteredData = useMemo(() => {
    return interns.filter((intern) => {
      const fullName = `${intern.user.first_name} ${intern.user.last_name || ""}`.toLowerCase();
      const matchesSearch = 
        fullName.includes(search.toLowerCase()) ||
        (intern.user.email?.toLowerCase() || "").includes(search.toLowerCase());
      
      const matchesStatus = status === "ALL" || intern.user.status?.toUpperCase() === status;
      const matchesDept = dept === "ALL" || intern.user.department_id === dept;
      const matchesDegree = degree === "ALL" || intern.degree === degree;
      const matchesCollege = college === "ALL" || intern.college_name === college;
      
      return matchesSearch && matchesStatus && matchesDept && matchesDegree && matchesCollege;
    });
  }, [interns, search, status, dept, degree, college]);

  const reportStats = useMemo(() => {
    if (variant !== "report") return null;
    const active = interns.filter(i => i.user?.status?.toLowerCase() === 'active').length;
    const completed = interns.filter(i => i.user?.status?.toLowerCase() === 'completed').length;
    const avgPoints = interns.length > 0 ? Math.round(interns.reduce((acc, i) => acc + (i.total_points || 0), 0) / interns.length) : 0;
    const avgStreak = interns.length > 0 ? Math.round(interns.reduce((acc, i) => acc + (i.streak || 0), 0) / interns.length * 10) / 10 : 0;
    
    return {
      total: interns.length,
      active,
      completed,
      avgPoints,
      avgStreak
    };
  }, [interns, variant]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    const intern = interns.find(i => i.id === deleteTargetId);
    if (!intern) return;

    setIsDeleting(true);
    try {
      await graphqlService.deleteIntern(deleteTargetId, intern.user_id);
      setInterns(prev => prev.filter(i => i.id !== deleteTargetId));
      toast.success("Intern deleted successfully");
      setDeleteTargetId(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete intern");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {variant === "report" && reportStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
           <StatCard 
             title="Total Intern Corps" 
             value={reportStats.total} 
             icon={<Users size={20} />} 
             color="#7C3AED" 
             description="Cumulative registered users"
           />
           <StatCard 
             title="Operational Nodes" 
             value={reportStats.active} 
             icon={<Activity size={20} />} 
             color="#10B981" 
             description="Active execution units"
           />
           <StatCard 
             title="Performance Yield" 
             value={`${reportStats.avgPoints} pts`} 
             icon={<Target size={20} />} 
             color="#00D4FF" 
             description="Average point distribution"
           />
           <StatCard 
             title="Avg Consistency" 
             value={`${reportStats.avgStreak}d`} 
             icon={<Zap size={20} />} 
             color="#F59E0B" 
             description="Inter-departmental streak avg"
           />
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 rounded-2xl border-primary/10 shadow-xl overflow-visible relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] -mr-16 -mt-16 pointer-events-none" />
        <SearchBar value={search} onChange={setSearch} />
        <FilterBar 
          status={status} 
          onStatusChange={setStatus} 
          department={mode === "SUPER_ADMIN" ? dept : undefined}
          onDepartmentChange={mode === "SUPER_ADMIN" ? setDept : undefined}
          departments={departments}
          degree={degree}
          onDegreeChange={setDegree}
          degrees={uniqueDegrees}
          college={college}
          onCollegeChange={setCollege}
          colleges={uniqueColleges}
        />
      </div>

      <div className="glass-card rounded-[2rem] border-border/50 overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
        <InternTable 
          data={currentData} 
          isLoading={isLoading} 
          mode={mode} 
          variant={variant}
          onDelete={(id) => setDeleteTargetId(id)}
        />
      </div>

      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={setCurrentPage} 
      />

      <ConfirmModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="Delete Intern"
        description="Are you sure you want to delete this intern? This will remove all their data and access. This action cannot be undone."
        isLoading={isDeleting}
        confirmText="Delete Intern"
      />
    </div>
  );
}

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
          graphqlService.getInterns(organization_id, targetDeptId),
          graphqlService.getDepartments(organization_id)
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

  const filteredData = useMemo(() => {
    return interns.filter((intern) => {
      const fullName = `${intern.user.first_name} ${intern.user.last_name || ""}`.toLowerCase();
      const matchesSearch = 
        fullName.includes(search.toLowerCase()) ||
        (intern.user.email?.toLowerCase() || "").includes(search.toLowerCase());
      
      const matchesStatus = status === "ALL" || intern.user.status === status;
      const matchesDept = dept === "ALL" || intern.user.department_id === dept;
      
      return matchesSearch && matchesStatus && matchesDept;
    });
  }, [interns, search, status, dept]);

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <SearchBar value={search} onChange={setSearch} />
        <FilterBar 
          status={status} 
          onStatusChange={setStatus} 
          department={mode === "SUPER_ADMIN" ? dept : undefined}
          onDepartmentChange={mode === "SUPER_ADMIN" ? setDept : undefined}
          departments={departments}
        />
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
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

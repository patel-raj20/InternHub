"use client";

import { useState, useMemo } from "react";
import { Intern } from "@/lib/types";
import { InternTable } from "@/components/interns/intern-table";
import { SearchBar } from "@/components/interns/search-bar";
import { FilterBar } from "@/components/interns/filter-bar";
import { Pagination } from "@/components/ui/pagination";

interface InternsListProps {
  initialData: Intern[];
  mode: "ADMIN" | "SUPER_ADMIN";
  departments?: { depart_id: string; name: string }[];
}

export function InternsList({ initialData, mode, departments }: InternsListProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [dept, setDept] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredData = useMemo(() => {
    return initialData.filter((intern) => {
      const matchesSearch = 
        intern.full_name.toLowerCase().includes(search.toLowerCase()) ||
        (intern.email?.toLowerCase() || "").includes(search.toLowerCase());
      
      const matchesStatus = status === "ALL" || intern.status === status;
      const matchesDept = dept === "ALL" || intern.department_id === dept;
      
      return matchesSearch && matchesStatus && matchesDept;
    });
  }, [initialData, search, status, dept]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
        <InternTable data={currentData} mode={mode} />
      </div>

      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={setCurrentPage} 
      />
    </div>
  );
}

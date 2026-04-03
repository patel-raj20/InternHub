"use client";

import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Filter } from "lucide-react";

interface FilterBarProps {
  status: string;
  onStatusChange: (status: string) => void;
  department?: string;
  onDepartmentChange?: (dept: string) => void;
  departments?: { id: string; name: string }[];
  degree?: string;
  onDegreeChange?: (degree: string) => void;
  degrees?: string[];
  college?: string;
  onCollegeChange?: (college: string) => void;
  colleges?: string[];
}

export function FilterBar({ 
  status, 
  onStatusChange, 
  department, 
  onDepartmentChange, 
  departments,
  degree,
  onDegreeChange,
  degrees,
  college,
  onCollegeChange,
  colleges
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-xl border border-border/50">
        <Filter className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Filters</span>
      </div>

      <div className="flex items-center gap-2">
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[130px] h-10 rounded-xl border-border/50 bg-muted/30">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="glass-card">
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="DROPPED">Dropped</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {onDepartmentChange && departments && (
        <div className="flex items-center gap-2">
          <Select value={department} onValueChange={onDepartmentChange}>
            <SelectTrigger className="w-[160px] h-10 rounded-xl border-border/50 bg-muted/30">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent className="glass-card">
              <SelectItem value="ALL">All Departments</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {onDegreeChange && degrees && (
        <div className="flex items-center gap-2">
          <Select value={degree} onValueChange={onDegreeChange}>
            <SelectTrigger className="w-[160px] h-10 rounded-xl border-border/50 bg-muted/30">
              <SelectValue placeholder="Degree" />
            </SelectTrigger>
            <SelectContent className="glass-card">
              <SelectItem value="ALL">All Degrees</SelectItem>
              {degrees.map((deg) => (
                <SelectItem key={deg} value={deg}>{deg}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {onCollegeChange && colleges && (
        <div className="flex items-center gap-2">
          <Select value={college} onValueChange={onCollegeChange}>
            <SelectTrigger className="w-[180px] h-10 rounded-xl border-border/50 bg-muted/30">
              <SelectValue placeholder="College" />
            </SelectTrigger>
            <SelectContent className="glass-card">
              <SelectItem value="ALL">All Colleges</SelectItem>
              {colleges.map((col) => (
                <SelectItem key={col} value={col}>{col}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

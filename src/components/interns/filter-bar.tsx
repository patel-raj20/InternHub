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
}

export function FilterBar({ 
  status, 
  onStatusChange, 
  department, 
  onDepartmentChange, 
  departments 
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-xl border border-border/50">
        <Filter className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Filters</span>
      </div>

      <div className="flex items-center gap-2">
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[140px] h-10 rounded-xl border-border/50 bg-muted/30">
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
            <SelectTrigger className="w-[180px] h-10 rounded-xl border-border/50 bg-muted/30">
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
    </div>
  );
}

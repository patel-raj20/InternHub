"use client";

import { Department } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Trash2, Edit2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DepartmentListProps {
  departments: Department[];
  onEdit: (dept: Department) => void;
  onDelete: (id: string) => void;
}

export function DepartmentList({ departments, onEdit, onDelete }: DepartmentListProps) {
  return (
    <div className="rounded-2xl border border-border/50 overflow-hidden bg-card/30 backdrop-blur-md">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Department Name</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Description</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Total Interns</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest py-4 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {departments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-32 text-center text-muted-foreground font-medium">
                No departments registered for this organization.
              </TableCell>
            </TableRow>
          ) : (
            departments.map((dept) => (
              <TableRow key={dept.id} className="hover:bg-muted/30 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Building2 className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-bold tracking-tight">{dept.name}</span>
                  </div>
                </TableCell>
                <TableCell className="max-w-[300px] truncate text-muted-foreground text-xs leading-relaxed">
                  {dept.description || "—"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-muted-foreground/60" />
                    <Badge variant="active" className="font-black text-[9px] px-2 py-0">
                      {dept.count || 0} Interns
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(dept)} className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-all">
                      <Edit2 size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(dept.id)} className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-500 transition-all">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

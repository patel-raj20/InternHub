"use client";

import { useEffect, useState } from "react";
import { getDepartments, deleteDepartment, createDepartment } from "@/lib/api/departments";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Building2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Department } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DepartmentsPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const data = await getDepartments();
      setDepartments([...data]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this department?")) {
      await deleteDepartment(id);
      fetchDepartments();
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Departments</h1>
          <p className="text-muted-foreground mt-1">Configure the organizational units for interns.</p>
        </div>
        <Link href="/super-admin/departments/create">
          <Button className="gap-2 h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg neon-glow scale-105 hover:scale-110 active:scale-95 transition-all">
            <Plus className="w-4 h-4" /> Add Department
          </Button>
        </Link>
      </div>

      <Card className="glass-card border-border/50 shadow-2xl overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">
            <Building2 className="w-4 h-4 text-primary" />
            Registered Departments
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 border-t border-border/50">
          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">ID</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Department Name</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Intern Count</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Created At</TableHead>
                  <TableHead className="text-right text-[10px] font-black uppercase tracking-widest">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((dept) => (
                  <TableRow key={dept.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="font-mono text-[10px] font-bold text-muted-foreground">#{dept.id}</TableCell>
                    <TableCell className="font-black text-sm tracking-tight">{dept.name}</TableCell>
                    <TableCell>
                      <span className="font-black text-primary">{dept.count}</span>
                      <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest ml-2">Interns</span>
                    </TableCell>
                    <TableCell className="text-xs font-bold text-muted-foreground/80">{new Date(dept.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10 hover:text-red-600 transition-all"
                        onClick={() => handleDelete(dept.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

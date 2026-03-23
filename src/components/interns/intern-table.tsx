"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import { Intern } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface InternTableProps {
  data: Intern[];
  isLoading?: boolean;
  mode: "ADMIN" | "SUPER_ADMIN";
  onDelete?: (id: string) => void;
}

export function InternTable({ data, isLoading, mode, onDelete }: InternTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border/50 overflow-hidden bg-card/30 backdrop-blur-md">
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (data.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground font-black uppercase tracking-widest text-[10px]">
        No interns found
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table className="min-w-[800px]">
        <TableHeader>
          <TableRow>
            <TableHead className="font-black uppercase tracking-widest text-[10px]">ID</TableHead>
            <TableHead className="font-black uppercase tracking-widest text-[10px]">Name</TableHead>
            <TableHead className="font-black uppercase tracking-widest text-[10px]">Email</TableHead>
            <TableHead className="font-black uppercase tracking-widest text-[10px]">Status</TableHead>
            <TableHead className="font-black uppercase tracking-widest text-[10px]">Joining Date</TableHead>
            <TableHead className="font-black uppercase tracking-widest text-[10px]">Backlogs</TableHead>
            <TableHead className="text-right font-black uppercase tracking-widest text-[10px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((intern) => (
            <TableRow key={intern.intern_id} className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-black tracking-tighter">#{intern.enrollment_number}</TableCell>
              <TableCell className="font-bold">{intern.full_name}</TableCell>
              <TableCell className="text-muted-foreground">{intern.email}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    intern.status === "ACTIVE"
                      ? "active"
                      : intern.status === "COMPLETED"
                      ? "completed"
                      : "dropped"
                  }
                >
                  {intern.status}
                </Badge>
              </TableCell>
              <TableCell className="text-xs font-bold">{new Date(intern.joining_date).toLocaleDateString()}</TableCell>
              <TableCell className="text-center font-black">{intern.no_of_backlogs}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Link href={`${mode === 'SUPER_ADMIN' ? '/super-admin' : '/admin'}/interns/${intern.intern_id}`}>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  {mode === "SUPER_ADMIN" && (
                    <>
                      <Link href={`/super-admin/interns/${intern.intern_id}/edit`}>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        onClick={() => onDelete?.(intern.intern_id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

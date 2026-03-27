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
  variant?: "management" | "report";
  onDelete?: (id: string) => void;
}

export function InternTable({ data, isLoading, mode, variant = "management", onDelete }: InternTableProps) {
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
      <Table className="min-w-[1000px]">
        <TableHeader>
          <TableRow>
            {variant === "management" ? (
              <>
                <TableHead className="font-black uppercase tracking-widest text-[10px]">ID</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px]">Name</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px]">College</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px]">Status</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px]">Joining Date</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px]">End Date</TableHead>
                <TableHead className="text-right font-black uppercase tracking-widest text-[10px]">Actions</TableHead>
              </>
            ) : (
              <>
                <TableHead className="font-black uppercase tracking-widest text-[10px]">Enrollment Number</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px]">Account Credentials</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px]">College Name</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px]">Department</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px]">Status</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px]">Joining Date</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px]">End Date</TableHead>
                <TableHead className="text-right font-black uppercase tracking-widest text-[10px]">Actions</TableHead>
              </>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((intern) => (
            <TableRow key={intern.id} className="hover:bg-muted/30 transition-colors">
              {variant === "management" ? (
                <>
                  <TableCell className="font-black tracking-tighter">#{intern.id.slice(0, 8)}</TableCell>
                  <TableCell className="font-bold">
                    <div>
                      <div className="font-bold">{`${intern.user.first_name} ${intern.user.last_name || ""}`}</div>
                      <div className="text-[10px] text-muted-foreground font-medium">{intern.user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs font-medium">{intern.college_name || "N/A"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        intern.user.status === "ACTIVE"
                          ? "active"
                          : "dropped"
                      }
                    >
                      {intern.user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-bold">{new Date(intern.joining_date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-xs font-bold text-muted-foreground">{intern.end_date ? new Date(intern.end_date).toLocaleDateString() : "Present"}</TableCell>
                                    <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`${mode === 'SUPER_ADMIN' ? '/super-admin' : '/admin'}/interns/${intern.id}`}>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      {mode === "SUPER_ADMIN" && (
                        <>
                          <Link href={`/super-admin/interns/${intern.id}/edit`}>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                            onClick={() => onDelete?.(intern.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell className="font-mono text-[10px] font-bold">
                    {intern.enrollment_number || intern.id.slice(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <div className="font-bold text-sm tracking-tight">{`${intern.user.first_name} ${intern.user.last_name || ""}`}</div>
                      <div className="text-[10px] text-muted-foreground font-bold">{intern.user.email}</div>
                      <div className="text-[10px] text-muted-foreground/60">{intern.user.phone || "No phone"}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-muted-foreground">{intern.college_name || "N/A"}</TableCell>
                  <TableCell>
                     <Badge variant="default" className="text-[9px] font-black uppercase tracking-widest opacity-70">{intern.user.department?.name || "N/A"}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        intern.user.status === "ACTIVE"
                          ? "active"
                          : "dropped"
                      }
                      className="text-[9px]"
                    >
                      {intern.user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[10px] font-black">{new Date(intern.joining_date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-[10px] font-black text-muted-foreground">
                    {intern.end_date ? new Date(intern.end_date).toLocaleDateString() : "Present"}
                  </TableCell>
                                    <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`${mode === 'SUPER_ADMIN' ? '/super-admin' : '/admin'}/interns/${intern.id}`}>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      {mode === "SUPER_ADMIN" && (
                        <>
                          <Link href={`/super-admin/interns/${intern.id}/edit`}>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                            onClick={() => onDelete?.(intern.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

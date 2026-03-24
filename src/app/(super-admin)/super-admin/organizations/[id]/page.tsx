"use client";

import { useEffect, useState, use } from "react";
import { getOrganizationById } from "@/lib/api/organizations";
import { getDepartmentsByOrg, createDepartment, deleteDepartment } from "@/lib/api/departments";
import { Organization, Department } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Plus, Building2, Globe, ArrowLeft, LayoutDashboard, Database } from "lucide-react";
import Link from "next/link";
import { DepartmentList } from "@/components/departments/department-list";
import { DepartmentFormModal } from "@/components/departments/department-form-modal";
import { cn } from "@/lib/utils";

export default function OrganizationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [activeTab, setActiveTab] = useState<"departments" | "stats">("departments");

  useEffect(() => {
    const fetchData = async () => {
      const org = await getOrganizationById(id);
      if (org) {
        setOrganization(org);
        const depts = await getDepartmentsByOrg(id);
        setDepartments(depts);
      }
    };
    fetchData();
  }, [id]);

  const handleAddDept = async (data: any) => {
    if (editingDept) {
      // await updateDepartment(editingDept.id, data);
    } else {
      await createDepartment(id, data);
    }
    const depts = await getDepartmentsByOrg(id);
    setDepartments(depts);
  };

  const handleDeleteDept = async (id: string) => {
    if (confirm("Are you sure you want to delete this department?")) {
      await deleteDepartment(id);
      const depts = await getDepartmentsByOrg(id);
      setDepartments(depts);
    }
  };

  if (!organization) return <div className="p-8">Loading...</div>;

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="space-y-6">
        <Link href="/super-admin/organizations">
          <Button variant="ghost" size="sm" className="gap-2 pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Organizations
          </Button>
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 glass-card p-8 rounded-[2rem] border-primary/10 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
          
          <div className="flex items-center gap-6 relative">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
               <Building2 className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase">{organization.name}</h1>
              <div className="flex items-center gap-4 mt-2">
                <a href={organization.website} target="_blank" className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5 bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                  <Globe size={14} /> {organization.website?.replace("https://", "")}
                </a>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-3 py-1 bg-muted/30 rounded-full border border-border/50">
                  ID: {organization.id}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 relative">
            <Button variant="outline" className="rounded-xl border-border/50 hover:bg-muted font-bold uppercase tracking-widest text-[10px]">Edit Profile</Button>
            <Button className="rounded-xl bg-primary hover:bg-primary/90 font-black uppercase tracking-widest text-[10px] neon-glow">Export Data</Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-6">
        <div className="flex gap-1 p-1 bg-muted/30 backdrop-blur-md rounded-2xl w-fit border border-border/30">
          <button 
            onClick={() => setActiveTab("departments")}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-300 font-black text-[11px] uppercase tracking-widest",
              activeTab === "departments" ? "bg-primary text-primary-foreground shadow-lg neon-glow" : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            <LayoutDashboard size={16} /> Departments
          </button>
          <button 
            onClick={() => setActiveTab("stats")}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-300 font-black text-[11px] uppercase tracking-widest",
              activeTab === "stats" ? "bg-primary text-primary-foreground shadow-lg neon-glow" : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            <Database size={16} /> Engagement
          </button>
        </div>

        {activeTab === "departments" ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Departmental Structure</h2>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">Management of operational units within the organization</p>
              </div>
              <Button onClick={() => { setEditingDept(null); setIsModalOpen(true); }} className="gap-2 rounded-xl font-black uppercase tracking-widest text-[11px] h-11 px-6 shadow-lg shadow-primary/20 neon-glow">
                <Plus size={18} /> Add Department
              </Button>
            </div>

            <DepartmentList 
              departments={departments} 
              onEdit={(dept) => { setEditingDept(dept); setIsModalOpen(true); }}
              onDelete={handleDeleteDept}
            />
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-border/50 rounded-[2rem] bg-muted/20">
             <p className="text-muted-foreground/60 font-black uppercase tracking-[0.3em] text-[10px]">Analytics Module Offline</p>
          </div>
        )}
      </div>

      <DepartmentFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleAddDept}
        initialData={editingDept}
      />
    </div>
  );
}

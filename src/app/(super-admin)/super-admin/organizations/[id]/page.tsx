"use client";

import { useEffect, useState, use } from "react";
import { graphqlService } from "@/lib/services/graphql-service";
import { Organization, Department, Intern } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Database, LayoutDashboard, Plus, Building2, Globe, ArrowLeft, Users, TrendingUp, GraduationCap } from "lucide-react";
import Link from "next/link";
import { DepartmentList } from "@/components/departments/department-list";
import { DepartmentFormModal } from "@/components/departments/department-form-modal";
import { OrganizationFormModal } from "@/components/organizations/organization-form-modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { OrganizationStats } from "@/components/organizations/organization-stats";


export default function OrganizationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [allInterns, setAllInterns] = useState<Intern[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [activeTab, setActiveTab] = useState<"departments" | "stats">("departments");

  const fetchData = async () => {
    try {
      const [orgData, deptsData, internsData] = await Promise.all([
        graphqlService.getOrganizationById(id),
        graphqlService.getDepartments(id),
        graphqlService.getInterns(id)
      ]);
      setOrganization(orgData);
      setDepartments(deptsData);
      setAllInterns(internsData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load organization details");
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAddDept = async (data: any) => {
    try {
      if (editingDept) {
        await graphqlService.updateDepartment(editingDept.id, {
          name: data.name,
          description: data.description,
        });
        toast.success("Department updated");
      } else {
        await graphqlService.addDepartment({
          ...data,
          organization_id: id,
          description: data.description || "",
        });
        toast.success("Department added");
      }
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Operation failed");
    }
  };

  const handleUpdateOrg = async (data: any) => {
    try {
      await graphqlService.updateOrganization(id, data);
      toast.success("Organization profile updated");
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update organization");
    }
  };

  const handleDeleteDept = async () => {
    if (!deleteTargetId) return;
    
    setIsDeleting(true);
    try {
      await graphqlService.deleteDepartment(deleteTargetId);
      toast.success("Department deleted successfully");
      setDeleteTargetId(null);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete department");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportPDF = async () => {
    const loadingToast = toast.loading("Generating PDF report...");
    try {
      const { default: jsPDF } = await import("jspdf");
      await import("jspdf-autotable");
      // Use Landscape orientation for more data columns
      const doc = new jsPDF({ orientation: 'l' }) as any;
      
      // Document Title Header
      doc.setFontSize(24);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text("ORGANIZATION COMPREHENSIVE REPORT", 14, 22);
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(`Organization: ${organization?.name}`, 14, 32);
      doc.text(`Website: ${organization?.website || 'N/A'}`, 14, 40);
      
      // Decorative line
      doc.setDrawColor(0, 122, 255);
      doc.setLineWidth(1);
      doc.line(14, 46, 280, 46);

      let yPos = 55;

      for (const dept of departments) {
        const interns = await graphqlService.getInterns(id, dept.id);
        
        if (yPos > 180) { // More conservative for landscape
          doc.addPage();
          yPos = 20;
        }

        // Department Section Header
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 122, 255);
        doc.text(`DEPARTMENT: ${dept.name.toUpperCase()}`, 14, yPos);
        yPos += 8;

        const tableData = interns.map(intern => [
          `${intern.user.first_name} ${intern.user.last_name || ""}\n${intern.user.email}\n${intern.user.phone || "No Phone"}`,
          `${intern.college_name || "—"}\n${intern.degree || ""} (${intern.graduation_year || "—"})\nCGPA: ${intern.cgpa || "—"}`,
          `${intern.specialization || "—"}\nSkills: ${typeof intern.skills === 'string' ? intern.skills : (Array.isArray(intern.skills) ? intern.skills.join(', ') : '—')}`,
          `${new Date(intern.joining_date).toLocaleDateString()} to\n${intern.end_date ? new Date(intern.end_date).toLocaleDateString() : 'Present'}`,
          `${intern.address || ""}\n${intern.city || ""}, ${intern.country || ""}\n${intern.github_url || ""}`
        ]);

        const { default: autoTable } = await import("jspdf-autotable");
        autoTable(doc, {
          startY: yPos,
          head: [['Intern / Contact', 'Academic Info', 'Specialization & Skills', 'Duration', 'Location & Links']],
          body: tableData,
          theme: 'striped',
          styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
          headStyles: { 
            fillColor: [0, 122, 255], 
            textColor: [255, 255, 255],
            fontSize: 9,
            fontStyle: 'bold'
          },
          columnStyles: {
            0: { cellWidth: 60 },
            1: { cellWidth: 60 },
            2: { cellWidth: 60 },
            3: { cellWidth: 35 },
            4: { cellWidth: 50 },
          },
          margin: { left: 14, right: 14 }
        });

        // Update yPos for next department
        yPos = (doc as any).lastAutoTable.finalY + 20;
      }

      doc.save(`${organization?.name.replace(/\s+/g, '_')}_Inventory_Report.pdf`);
      toast.success("PDF report generated successfully", { id: loadingToast });
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF", { id: loadingToast });
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
            <Button 
                variant="outline" 
                onClick={() => setIsOrgModalOpen(true)}
                className="rounded-xl border-border/50 hover:bg-muted font-bold uppercase tracking-widest text-[10px]"
            >
                Edit Profile
            </Button>
            <Button 
              onClick={handleExportPDF}
              className="rounded-xl bg-primary hover:bg-primary/90 font-black uppercase tracking-widest text-[10px] neon-glow"
            >
              Export Data
            </Button>
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
              onEdit={(dept) => {
                setEditingDept(dept);
                setIsModalOpen(true);
              }}
              onDelete={(id) => setDeleteTargetId(id)}
            />
          </div>
        ) : (
          <OrganizationStats departments={departments} interns={allInterns} />
        )}
      </div>

      <DepartmentFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleAddDept}
        initialData={editingDept}
      />

      <OrganizationFormModal
        isOpen={isOrgModalOpen}
        onClose={() => setIsOrgModalOpen(false)}
        onSubmit={handleUpdateOrg}
        initialData={organization}
      />

      <ConfirmModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteDept}
        title="Delete Department"
        description="Are you sure you want to delete this department? This will remove all department data. This action cannot be undone."
        isLoading={isDeleting}
        confirmText="Delete Department"
      />
    </div>
  );
}

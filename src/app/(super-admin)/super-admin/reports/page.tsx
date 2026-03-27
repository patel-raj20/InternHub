import { InternsList } from "@/components/interns/interns-list";
import { FileText } from "lucide-react";

export default function SuperAdminReportsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-primary neon-glow" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">Analytical Reporting</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">All Interns</h1>
          <p className="text-muted-foreground mt-1">Comprehensive system-wide intern oversight and analytical data view.</p>
        </div>
      </div>

      <InternsList mode="SUPER_ADMIN" variant="report" />
    </div>
  );
}

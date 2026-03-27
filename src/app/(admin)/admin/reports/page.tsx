import { InternsList } from "@/components/interns/interns-list";
import { Users } from "lucide-react";

export default function AdminReportsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-primary neon-glow" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">Department Analysis</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">All Interns</h1>
          <p className="text-muted-foreground mt-1">Full overview of interns within the organizational database.</p>
        </div>
      </div>

      <InternsList mode="ADMIN" variant="report" />
    </div>
  );
}

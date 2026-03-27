import { StatCard } from "@/components/ui/stat-card";
import { Calendar, Building2, GraduationCap, CheckCircle2 } from "lucide-react";
import { Intern } from "@/lib/types";

interface InternStatsCardsProps {
  intern: Intern;
}

export function InternStatsCards({ intern }: InternStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Joining Date"
        value={new Date(intern.joining_date).toLocaleDateString()}
        icon={<Calendar className="w-4 h-4" />}
      />
      <StatCard
        title="Department"
        value={intern.user?.department?.name || "N/A"}
        icon={<Building2 className="w-4 h-4" />}
      />
      <StatCard
        title="CGPA"
        value={intern.cgpa ?? "N/A"}
        icon={<GraduationCap className="w-4 h-4" />}
      />
      <StatCard
        title="Status"
        value={intern.user?.status || "N/A"}
        icon={<CheckCircle2 className="w-4 h-4" />}
      />
    </div>
  );
}

import { StatCard } from "@/components/ui/stat-card";
import { Calendar, Building2, AlertCircle, CheckCircle2 } from "lucide-react";
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
        value={intern.department_name || "N/A"}
        icon={<Building2 className="w-4 h-4" />}
      />
      <StatCard
        title="Backlogs"
        value={intern.backlogs ?? 0}
        icon={<AlertCircle className="w-4 h-4" />}
        trend={(intern.backlogs ?? 0) > 0 ? { value: intern.backlogs!, label: "Needs attention", isPositive: false } : undefined}
      />
      <StatCard
        title="Status"
        value={intern.status}
        icon={<CheckCircle2 className="w-4 h-4" />}
      />
    </div>
  );
}

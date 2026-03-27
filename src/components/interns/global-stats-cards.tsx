import { StatCard } from "@/components/ui/stat-card";
import { Users, Building2, UserPlus, GraduationCap } from "lucide-react";

interface GlobalStatsCardsProps {
  totalInterns: number;
  totalDepartments: number;
  activeInterns: number;
}

export function GlobalStatsCards({ totalInterns, totalDepartments, activeInterns }: GlobalStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <StatCard
        title="Total Interns"
        value={totalInterns}
        icon={<Users className="w-4 h-4" />}
      />
      <StatCard
        title="Departments"
        value={totalDepartments}
        icon={<Building2 className="w-4 h-4" />}
      />
      <StatCard
        title="Active Interns"
        value={activeInterns}
        icon={<UserPlus className="w-4 h-4" />}
      />
    </div>
  );
}

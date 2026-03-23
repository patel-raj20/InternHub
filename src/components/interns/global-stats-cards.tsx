import { StatCard } from "@/components/ui/stat-card";
import { Users, Building2, UserPlus, GraduationCap } from "lucide-react";

interface GlobalStatsCardsProps {
  totalInterns: number;
  totalDepartments: number;
  activeInterns: number;
}

export function GlobalStatsCards({ totalInterns, totalDepartments, activeInterns }: GlobalStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Interns"
        value={totalInterns}
        icon={<Users className="w-4 h-4" />}
        trend={{ value: 8, label: "this quarter", isPositive: true }}
      />
      <StatCard
        title="Departments"
        value={totalDepartments}
        icon={<Building2 className="w-4 h-4" />}
        trend={{ value: 1, label: "new this month", isPositive: true }}
      />
      <StatCard
        title="Active Interns"
        value={activeInterns}
        icon={<UserPlus className="w-4 h-4" />}
        trend={{ value: 15, label: "vs last quarter", isPositive: true }}
      />
      <StatCard
        title="Success Rate"
        value="94%"
        icon={<GraduationCap className="w-4 h-4" />}
        trend={{ value: 2, label: "vs last year", isPositive: true }}
      />
    </div>
  );
}

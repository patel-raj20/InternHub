import { StatCard } from "@/components/ui/stat-card";
import { Users, Activity, GraduationCap } from "lucide-react";

interface DeptStatsCardsProps {
  total: number;
  active: number;
  completed: number;
}

export function DeptStatsCards({ total, active, completed }: DeptStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
      <StatCard
        title="Total Interns"
        value={total}
        color="var(--primary)"
        icon={<Users className="w-5 h-5" />}
      />
      <StatCard
        title="Active Interns"
        value={active}
        color="#10B981"
        icon={<Activity className="w-5 h-5" />}
      />
      <StatCard
        title="Completed Interns"
        value={completed}
        color="#F59E0B"
        icon={<GraduationCap className="w-5 h-5" />}
      />
    </div>
  );
}

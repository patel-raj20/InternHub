import { StatCard } from "@/components/ui/stat-card";
import { Users, UserCheck, UserPlus } from "lucide-react";

interface DeptStatsCardsProps {
  total: number;
  active: number;
  completed: number;
}

export function DeptStatsCards({ total, active, completed }: DeptStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
      <StatCard
        title="Total Interns"
        value={total}
        icon={<Users className="w-4 h-4" />}
        trend={{ value: 4, label: "from last week", isPositive: true }}
      />
      <StatCard
        title="Active Interns"
        value={active}
        icon={<UserPlus className="w-4 h-4" />}
        trend={{ value: 12, label: "from last month", isPositive: true }}
      />
      <StatCard
        title="Completed Interns"
        value={completed}
        icon={<UserCheck className="w-4 h-4" />}
        trend={{ value: 2, label: "since yesterday", isPositive: false }}
      />
    </div>
  );
}

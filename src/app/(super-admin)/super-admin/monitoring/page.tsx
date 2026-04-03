import { TaskMonitoringPage } from "@/components/interns/TaskMonitoringPage";

export const metadata = {
  title: "Organization Monitoring | Super Admin",
  description: "Monitor and track task performance across the entire organization.",
};

export default function SuperAdminMonitoringPage() {
  return <TaskMonitoringPage mode="SUPER_ADMIN" />;
}

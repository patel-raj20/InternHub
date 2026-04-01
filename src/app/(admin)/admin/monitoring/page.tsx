import { TaskMonitoringPage } from "@/components/interns/TaskMonitoringPage";

export const metadata = {
  title: "Monitor Tasks | Admin",
  description: "Monitor and track intern task progress for your department.",
};

export default function AdminMonitoringPage() {
  return <TaskMonitoringPage mode="ADMIN" />;
}

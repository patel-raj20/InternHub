import { AssignTasksPage } from "@/components/interns/AssignTasksPage";

export const metadata = {
  title: "Assign Tasks | InternHub",
  description: "Assign gamified tasks to interns with categories and difficulty-based rewards.",
};

export default function SuperAdminAssignTasksPage() {
  return <AssignTasksPage mode="SUPER_ADMIN" />;
}

import { use } from "react";
import InternDetailPage from "@/components/interns/intern-detail-view";

export default function SuperAdminInternDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return <InternDetailPage params={resolvedParams} role="SUPER_ADMIN" />;
}

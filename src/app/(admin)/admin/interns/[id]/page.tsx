import { use } from "react";
import InternDetailPage from "@/components/interns/intern-detail-view";

export default function AdminInternDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return <InternDetailPage params={resolvedParams} role="ADMIN" />;
}

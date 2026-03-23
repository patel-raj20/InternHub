import InternDetailPage from "@/components/interns/intern-detail-view";

export default async function SuperAdminInternDetail({ params }: { params: { id: string } }) {
  return <InternDetailPage params={params} role="SUPER_ADMIN" />;
}

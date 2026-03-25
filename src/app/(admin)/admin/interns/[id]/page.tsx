import InternDetailPage from "@/components/interns/intern-detail-view";

export default async function AdminInternDetail({ params }: { params: { id: string } }) {
  return <InternDetailPage params={params} role="ADMIN" />;
}

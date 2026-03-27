import { InternsList } from "@/components/interns/interns-list";

export default function AdminInternsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 text-left">
        <h1 className="text-3xl font-bold tracking-tight">Manage Interns</h1>
        <p className="text-muted-foreground mt-1">View and filter interns assigned to your department.</p>
      </div>

      <InternsList mode="ADMIN" />
    </div>
  );
}

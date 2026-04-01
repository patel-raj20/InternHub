import { InternsList } from "@/components/interns/interns-list";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import Link from "next/link";

export default function SuperAdminInternsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight uppercase">Organization Interns</h1>
          <p className="text-muted-foreground mt-1 text-[11px] font-bold uppercase tracking-widest opacity-60">Manage all interns within your organizational units.</p>
        </div>
        <Link href="/super-admin/create-intern">
          <Button className="gap-2">
            <UserPlus className="w-4 h-4" /> Add Intern
          </Button>
        </Link>
      </div>

      <InternsList mode="SUPER_ADMIN" />
    </div>
  );
}

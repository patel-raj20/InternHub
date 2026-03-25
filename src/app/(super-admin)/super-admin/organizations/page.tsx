import { getOrganizations } from "@/lib/api/organizations";
import { Button } from "@/components/ui/button";
import { Plus, Globe, Building2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrganizationCard } from "@/components/organizations/organization-card";

export default async function OrganizationsListPage() {
  const organizations = await getOrganizations();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Organizations</h1>
          <p className="text-muted-foreground mt-1 text-sm">Register and manage partner companies in the platform.</p>
        </div>
        <Link href="/super-admin/organizations/create">
          <Button className="gap-2 shadow-lg shadow-primary/20 neon-glow">
            <Plus size={18} /> Add Organization
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizations.map((org) => (
          <OrganizationCard key={org.id} org={org} />
        ))}
      </div>
    </div>
  );
}

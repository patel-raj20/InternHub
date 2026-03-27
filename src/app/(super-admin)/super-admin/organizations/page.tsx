"use client";

import { useEffect, useState } from "react";
import { graphqlService } from "@/lib/services/graphql-service";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { OrganizationCard } from "@/components/organizations/organization-card";
import { Organization } from "@/lib/types";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";

export default function OrganizationsListPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [targetId, setTargetId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrgs = async () => {
      setIsLoading(true);
      try {
        const data = await graphqlService.getOrganizations();
        setOrganizations(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load organizations");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrgs();
  }, []);

  const handleDelete = async () => {
    if (!targetId) return;
    
    setIsDeleting(true);
    try {
      await graphqlService.deleteOrganization(targetId);
      setOrganizations(prev => prev.filter(org => org.id !== targetId));
      toast.success("Organization deleted successfully");
      setTargetId(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete organization. Check for dependent records.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Organizations</h1>
          <p className="text-muted-foreground mt-1 text-sm">Register and manage partner companies in the platform.</p>
        </div>
        <Link href="/super-admin/organizations/create">
          <Button className="gap-2 shadow-lg shadow-primary/20 neon-glow h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[10px]">
            <Plus size={18} /> Add Organization
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((org) => (
            <OrganizationCard key={org.id} org={org} onDelete={() => setTargetId(org.id)} />
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!targetId}
        onClose={() => setTargetId(null)}
        onConfirm={handleDelete}
        title="Delete Organization"
        description="Are you sure you want to delete this organization? This will remove all associated departments and interns. This action cannot be undone."
        isLoading={isDeleting}
        confirmText="Delete Organization"
      />
    </div>
  );
}

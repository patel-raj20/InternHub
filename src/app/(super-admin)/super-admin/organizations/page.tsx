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

import { useSelector } from "react-redux";
import { RootState } from "@/store";

export default function OrganizationsListPage() {
  const { role } = useSelector((state: RootState) => state.user);
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
    <div className="max-w-7xl mx-auto py-10 px-6 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--primary)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">Ecosystem Management</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tighter leading-none uppercase">
            Partner Network
          </h1>
          <p className="text-muted-foreground font-medium text-sm lg:text-base max-w-xl">
             Comprehensive directory of organizational nodes integrated into the InternHub ecosystem.
          </p>
        </div>
        
        <Link href="/super-admin/organizations/create">
          <Button className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 neon-glow transition-all hover:scale-105 active:scale-95">
            <Plus size={16} className="mr-2" /> Add New Organization
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {organizations.map((org) => (
            <OrganizationCard 
              key={org.id} 
              org={org} 
              onDelete={() => setTargetId(org.id)} 
              isReadOnly={role === 'DEVELOPER'}
            />
          ))}
          {organizations.length === 0 && (
             <div className="col-span-full py-24 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">No partner nodes detected in registry</p>
             </div>
          )}
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

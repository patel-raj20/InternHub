"use client";

import { Organization } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Globe, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface OrganizationCardProps {
  org: Organization;
  onDelete?: () => void;
}

export function OrganizationCard({ org, onDelete }: OrganizationCardProps) {
  const router = useRouter();

  return (
    <Card 
      onClick={() => router.push(`/super-admin/organizations/${org.id}`)}
      className="group hover:border-primary/50 cursor-pointer h-full transition-all duration-300 glass-card overflow-hidden"
    >
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
                <Building2 className="w-5 h-5 text-primary" />
             </div>
             <div>
               <CardTitle className="text-lg leading-tight uppercase font-black">{org.name}</CardTitle>
               <Badge variant="default" className="mt-1 text-[8px] px-2 py-0">{org.industry || "Uncategorized"}</Badge>
             </div>
          </div>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-6 min-h-[60px]">
          {org.description || "No description provided for this organization."}
        </p>
        
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <a 
            href={org.website} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 text-xs font-bold text-primary hover:underline hover:scale-105 transition-all z-10"
          >
            <Globe size={14} /> Visit Website <ExternalLink size={10} />
          </a>
          <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
            Est. {new Date(org.created_at).getFullYear()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { Organization } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Globe, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface OrganizationCardProps {
  org: Organization;
  onDelete?: () => void;
  isReadOnly?: boolean;
}

export function OrganizationCard({ org, onDelete, isReadOnly = false }: OrganizationCardProps) {
  const router = useRouter();

  return (
    <Card 
      onClick={() => !isReadOnly && router.push(`/super-admin/organizations/${org.id}`)}
      className={cn(
        "group relative transition-all duration-700 glass-card overflow-hidden border-border/20",
        !isReadOnly ? "hover:border-primary/40 cursor-pointer shadow-2xl hover:shadow-primary/5" : "cursor-default shadow-xl"
      )}
    >
      {/* Dynamic Mesh Glow Background */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[80px] -mr-24 -mt-24 pointer-events-none group-hover:bg-primary/10 transition-colors duration-700" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/3 rounded-full blur-[60px] -ml-16 -mb-16 pointer-events-none" />

      <div className={cn("p-8 relative z-10 flex flex-col h-full", isReadOnly ? "p-10" : "p-8")}>
        {/* Header Cluster */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-5">
             <div className={cn(
                "relative rounded-2xl bg-background/50 flex items-center justify-center border border-border/40 transition-all duration-700",
                isReadOnly ? "w-16 h-16 shadow-lg shadow-primary/5" : "w-12 h-12 group-hover:scale-110"
             )}>
                <Building2 className={cn("text-primary transition-all duration-700", isReadOnly ? "w-8 h-8" : "w-6 h-6")} />
                {isReadOnly && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse shadow-[0_0_8px_var(--primary)] border-2 border-background" />
                )}
             </div>
             <div className="space-y-1.5 max-w-[220px]">
               <h3 className={cn(
                 "font-black tracking-tighter uppercase leading-[0.9] transition-all duration-700",
                 isReadOnly ? "text-2xl" : "text-xl",
                 "group-hover:text-primary/90"
               )}>
                 {org.name}
               </h3>
               <div className="flex items-center gap-2">
                 <Badge variant="outline" className="text-[9px] font-black uppercase tracking-[0.15em] py-0.5 border-primary/20 bg-primary/5 text-primary/80">
                   {org.industry || "General"}
                 </Badge>
                 {isReadOnly && (
                   <span className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] animate-pulse-subtle">Online</span>
                 )}
               </div>
             </div>
          </div>
          
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-9 w-9 rounded-xl text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition-all duration-500",
                !isReadOnly ? "opacity-0 group-hover:opacity-100" : "opacity-100"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="w-4.5 h-4.5" />
            </Button>
          )}
        </div>

        {/* Body Description */}
        <div className="flex-grow">
          <p className={cn(
            "text-muted-foreground font-medium leading-relaxed mb-8",
            isReadOnly ? "text-base line-clamp-4" : "text-sm line-clamp-3"
          )}>
            {org.description || "System node operational. No extended documentation provided for this organizational entity."}
          </p>
        </div>
        
        {/* Footer Metadata */}
        <div className="flex items-center justify-between pt-6 border-t border-border/10">
          {!isReadOnly ? (
            <a 
              href={org.website} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary transition-all hover:translate-x-1"
            >
              <Globe size={13} /> Visit Node <ArrowRight size={10} className="opacity-50" />
            </a>
          ) : (
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground/30">
              <Globe size={12} className="opacity-50" /> Secure Protocol • Registry Only
            </div>
          )}
          
          <div className="flex items-center gap-3">
             <div className="h-4 w-[1px] bg-border/20" />
             <div className="flex flex-col items-end">
                <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest">Est.</span>
                <span className="text-[11px] font-black text-primary/50 tabular-nums">
                  {new Date(org.created_at).getFullYear()}
                </span>
             </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

const ArrowRight = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M5 12h14m-7-7 7 7-7 7" />
  </svg>
);

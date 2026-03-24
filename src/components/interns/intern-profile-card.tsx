import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Globe, Github, Linkedin, Briefcase, Award } from "lucide-react";
import { Intern } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface InternProfileCardProps {
  intern: Intern;
}

export function InternProfileCard({ intern }: InternProfileCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-shrink-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center text-primary border-4 border-primary/20">
              <span className="text-4xl font-bold">{intern.full_name.charAt(0)}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4 flex-1">
            <InfoItem label="Full Name" value={intern.full_name} />
            <InfoItem label="Email" value={intern.email || "N/A"} />
            <InfoItem label="Phone" value={intern.phone || "N/A"} />
            <InfoItem label="DOB" value={intern.dob || "N/A"} />
            <InfoItem label="Blood Group" value={intern.blood_group || "N/A"} />
          </div>
        </div>

        {intern.bio && (
          <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2">Short Bio</p>
            <p className="text-sm font-medium leading-relaxed">{intern.bio}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-border/50">
          <div className="space-y-4">
             <div className="flex items-center gap-2 mb-4">
               <Globe className="w-4 h-4 text-primary" />
               <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Professional Presence</p>
             </div>
            <div className="grid grid-cols-1 gap-3">
               <InfoItem label="GitHub" value={intern.github_url || "Not linked"} isLink href={intern.github_url} />
               <InfoItem label="LinkedIn" value={intern.linkedin_url || "Not linked"} isLink href={intern.linkedin_url} />
               <InfoItem label="Portfolio" value={intern.portfolio_url || "Not linked"} isLink href={intern.portfolio_url} />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
               <Briefcase className="w-4 h-4 text-primary" />
               <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Location Details</p>
             </div>
            <div className="grid grid-cols-1 gap-3">
               <InfoItem label="Address" value={intern.address || "N/A"} />
               <div className="grid grid-cols-3 gap-2">
                 <InfoItem label="City" value={intern.city || "N/A"} />
                 <InfoItem label="State" value={intern.state || "N/A"} />
                 <InfoItem label="Country" value={intern.country || "N/A"} />
               </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-border/50">
           <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-4 h-4 text-primary" />
                <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Expertise & Skills</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {intern.skills ? (
                  (typeof intern.skills === 'string' ? intern.skills.split(',') : intern.skills).map((skill: string, i: number) => (
                    <Badge key={i} className="bg-primary/5 border-primary/20 text-primary uppercase text-[9px] font-black tracking-widest hover:bg-primary/10 transition-colors px-3 py-1">
                      {skill.trim()}
                    </Badge>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic">No skills listed</p>
                )}
              </div>
           </div>
           <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-4 h-4 text-primary" />
                <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Certifications</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {intern.certifications ? (
                   (typeof intern.certifications === 'string' ? intern.certifications.split(',') : intern.certifications).map((cert: string, i: number) => (
                    <Badge key={i} className="bg-muted border-border text-muted-foreground uppercase text-[9px] font-black tracking-widest px-3 py-1">
                      {cert.trim()}
                    </Badge>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic">No certifications listed</p>
                )}
              </div>
           </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoItem({ label, value, isLink, href }: { label: string; value: string; isLink?: boolean; href?: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">{label}</p>
      {isLink && href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-primary hover:underline truncate block">
          {value}
        </a>
      ) : (
        <p className="text-sm font-bold truncate">{value}</p>
      )}
    </div>
  );
}

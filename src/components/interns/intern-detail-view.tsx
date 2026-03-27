"use client";

import { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Loader2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  GraduationCap, 
  Github, 
  Linkedin, 
  Globe,
  Building2,
  CalendarDays,
  Hash,
  Briefcase,
  Share2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { graphqlService } from "@/lib/services/graphql-service";
import { Intern } from "@/lib/types";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface InternDetailPageProps {
  params: { id: string };
  role: "ADMIN" | "SUPER_ADMIN";
}

export default function InternDetailPage({ params, role }: InternDetailPageProps) {
  const router = useRouter();
  const [intern, setIntern] = useState<Intern | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadIntern = async () => {
      setIsLoading(true);
      try {
        const data = await graphqlService.getInternById(params.id);
        if (!data) {
          toast.error("Intern not found");
          router.push(role === "SUPER_ADMIN" ? "/super-admin/interns" : "/admin/interns");
          return;
        }
        setIntern(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load intern details");
      } finally {
        setIsLoading(false);
      }
    };

    loadIntern();
  }, [params.id, role, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium animate-pulse">Loading intern profile...</p>
      </div>
    );
  }

  if (!intern) return null;

  const getInitials = (firstName: string, lastName?: string) => {
    return `${firstName[0]}${lastName?.[0] || ""}`.toUpperCase();
  };

  const deptHead = intern.user.department?.users?.[0];

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4 space-y-6">
      <div className="flex justify-between items-center mb-2">
        <Link href={role === "SUPER_ADMIN" ? "/super-admin/reports" : "/admin/reports"}>
          <Button variant="ghost" size="sm" className="gap-2 pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Back to Interns
          </Button>
        </Link>
        {role === "SUPER_ADMIN" && (
          <Link href={`/super-admin/interns/${intern.id}/edit`}>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-bold px-6">
              Edit Intern
            </Button>
          </Link>
        )}
      </div>

      {/* 1. IDENTITY CARD */}
      <Card className="overflow-hidden border-border/50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
             <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary border-4 border-primary/20 shrink-0">
               <span className="text-2xl font-black">{getInitials(intern.user.first_name, intern.user.last_name)}</span>
             </div>
             <div className="flex-grow text-center md:text-left">
               <div className="flex flex-col md:flex-row items-center gap-3 mb-1">
                 <h1 className="text-2xl font-black tracking-tight">{`${intern.user.first_name} ${intern.user.last_name || ""}`}</h1>
                 <Badge 
                   variant={intern.user.status === 'ACTIVE' ? "active" : intern.user.status === 'COMPLETED' ? 'completed' : 'default'}
                   className="uppercase text-[9px] font-black tracking-widest px-2 py-0.5"
                 >
                   {intern.user.status}
                 </Badge>
               </div>
               <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-4 gap-y-1 text-sm text-muted-foreground font-medium">
                 <div className="flex items-center gap-1.5">
                   <Mail className="w-3.5 h-3.5" /> {intern.user.email}
                 </div>
                 <div className="flex items-center gap-1.5 text-muted-foreground/40 hidden md:block">•</div>
                 <div className="flex items-center gap-1.5">
                   <Phone className="w-3.5 h-3.5" /> {intern.user.phone || "N/A"}
                 </div>
               </div>
             </div>
             <div className="shrink-0 text-center md:text-right pt-4 md:pt-0">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-1">Internal ID</p>
               <p className="text-xs font-black bg-muted px-3 py-1 rounded-lg border border-border/50 text-muted-foreground">
                 {intern.id.slice(0, 8).toUpperCase()}
               </p>
             </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. INTERNSHIP INFO CARD */}
      <Card className="border-border/50 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-muted/30 px-6 py-3 border-b border-border/50 flex items-center gap-2">
            <Briefcase className="w-3.5 h-3.5 text-muted-foreground/50" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 leading-none">Internship Info</p>
          </div>
          <div className="p-6 space-y-8">
            {/* Row 1: Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary/60 border border-primary/10">
                   <CalendarDays className="w-5 h-5" />
                 </div>
                 <div>
                   <p className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest mb-0.5">Joining Date</p>
                   <p className="text-sm font-bold">{intern.joining_date ? new Date(intern.joining_date).toLocaleDateString(undefined, { dateStyle: 'long' }) : "N/A"}</p>
                 </div>
               </div>
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-orange-500/5 flex items-center justify-center text-orange-500/60 border border-orange-500/10">
                   <Calendar className="w-5 h-5" />
                 </div>
                 <div>
                   <p className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest mb-0.5">End Date</p>
                   <p className="text-sm font-bold">{intern.end_date ? new Date(intern.end_date).toLocaleDateString(undefined, { dateStyle: 'long' }) : "N/A"}</p>
                 </div>
               </div>
            </div>

            <div className="h-[1px] bg-border/50 w-full" />

            {/* Row 2: Department Details */}
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex flex-col items-center md:items-start gap-1 min-w-[160px]">
                <div className="flex items-center gap-2 text-primary">
                  <Building2 className="w-4 h-4" />
                  <span className="text-lg font-black tracking-tight">{intern.user.department?.name || "N/A"}</span>
                </div>
                <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">Main Department</p>
              </div>
              
              <div className="hidden md:block w-[1px] h-10 bg-border/50" />
              
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground border border-border/50 shadow-inner">
                   <span className="text-base font-black">{deptHead ? getInitials(deptHead.first_name, deptHead.last_name) : "?"}</span>
                 </div>
                 <div>
                   <p className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest mb-1">Department Head</p>
                   <p className="text-sm font-bold leading-none mb-1.5">{deptHead ? `${deptHead.first_name} ${deptHead.last_name || ""}` : "No Head Assigned"}</p>
                   <div className="flex items-center gap-2 text-primary font-medium">
                     <Mail className="w-3.5 h-3.5" />
                     <p className="text-xs">{deptHead?.email || "head@organization.com"}</p>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. TWO COLUMN ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic Information */}
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6">
             <div className="flex items-center gap-2 mb-6">
               <GraduationCap className="w-3.5 h-3.5 text-muted-foreground/50" />
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 leading-none">Academic information</p>
             </div>
             <div className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                 <InfoField label="College" value={intern.college_name || "N/A"} />
                 <InfoField label="Degree" value={intern.degree || "N/A"} />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <InfoField label="Specialization" value={intern.specialization || "N/A"} />
                 <InfoField label="Grad Year" value={intern.graduation_year?.toString() || "N/A"} />
               </div>
               <div className="grid grid-cols-1 gap-4">
                 <InfoField label="CGPA" value={intern.cgpa?.toString() || "N/A"} />
               </div>
             </div>
          </CardContent>
        </Card>

        {/* Contact & Location */}
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6">
             <div className="flex items-center gap-2 mb-6">
               <MapPin className="w-3.5 h-3.5 text-muted-foreground/50" />
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 leading-none">Contact & location</p>
             </div>
             <div className="space-y-6">
               <div className="grid grid-cols-1 gap-4">
                 <InfoField label="Email Address" value={intern.user.email} />
                 <div className="grid grid-cols-2 gap-4">
                   <InfoField label="Phone" value={intern.user.phone || "N/A"} />
                   <InfoField label="Date of Birth" value={intern.dob || "N/A"} />
                 </div>
               </div>
               
               <div className="h-[1px] bg-border/30 w-full" />
               
               <div className="grid grid-cols-1 gap-4">
                 <div className="grid grid-cols-3 gap-2">
                   <InfoField label="City" value={intern.city || "N/A"} />
                   <InfoField label="State" value={intern.state || "N/A"} />
                   <InfoField label="Country" value={intern.country || "N/A"} />
                 </div>
                 <InfoField label="Address" value={intern.address || "N/A"} />
               </div>
             </div>
          </CardContent>
        </Card>
      </div>

      {/* 5. PROFESSIONAL PRESENCE CARD */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-6">
           <div className="flex items-center gap-2 mb-6">
             <Share2 className="w-3.5 h-3.5 text-muted-foreground/50" />
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 leading-none">Professional presence</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ProfileLink label="GitHub" value={intern.github_url} icon={Github} />
              <ProfileLink label="LinkedIn" value={intern.linkedin_url} icon={Linkedin} />
              <ProfileLink label="Portfolio" value={intern.portfolio_url} icon={Globe} />
           </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, isStatus }: { label: string; value: string; icon?: any; isStatus?: boolean }) {
  return (
    <Card className="bg-muted/30 border-border/50 shadow-none hover:bg-muted/50 transition-colors">
      <CardContent className="p-4 pt-4">
        <p className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest mb-2">{label}</p>
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-3.5 h-3.5 text-primary/60" />}
          {isStatus ? (
            <Badge 
              variant={value === 'ACTIVE' ? "active" : value === 'COMPLETED' ? 'completed' : 'default'}
              className="uppercase text-[9px] font-black tracking-widest px-2 py-0"
            >
              {value}
            </Badge>
          ) : (
            <span className="text-sm font-bold truncate">{value}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">{label}</p>
      <p className="text-sm font-bold text-foreground/90 leading-tight">{value}</p>
    </div>
  );
}

function ProfileLink({ label, value, icon: Icon }: { label: string; value?: string; icon: any }) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-xl border border-border/50 bg-muted/20">
      <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center border border-border/50 shadow-sm">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-grow min-w-0">
        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 mb-0.5">{label}</p>
        {value ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-primary hover:underline truncate block">
            {value.replace(/^https?:\/\/(www\.)?/, '')}
          </a>
        ) : (
          <Badge variant="default" className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">
            Not linked
          </Badge>
        )}
      </div>
    </div>
  );
}

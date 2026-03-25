import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { Intern } from "@/lib/types";

interface InternAcademicCardProps {
  intern: Intern;
}

export function InternAcademicCard({ intern }: InternAcademicCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-primary" />
          Academic Information
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
        <InfoItem label="Enrollment Number" value={intern.enrollment_number} />
        <InfoItem label="Department" value={intern.department_name || "N/A"} />
        <InfoItem label="College" value={intern.college_name || "N/A"} />
        <InfoItem label="Degree" value={intern.degree || "N/A"} />
        <InfoItem label="Specialization" value={intern.specialization || "N/A"} />
        <div className="grid grid-cols-2 gap-4">
           <InfoItem label="Grad Year" value={intern.graduation_year?.toString() || "N/A"} />
           <InfoItem label="CGPA" value={intern.cgpa?.toString() || "N/A"} />
        </div>
        <div className="grid grid-cols-2 gap-4">
           <InfoItem label="Joining Date" value={new Date(intern.joining_date).toLocaleDateString()} />
           <InfoItem label="End Date" value={intern.end_date ? new Date(intern.end_date).toLocaleDateString() : "Ongoing"} />
        </div>
      </CardContent>
    </Card>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">{label}</p>
      <p className="text-sm font-bold">{value}</p>
    </div>
  );
}

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
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <InfoItem label="Enrollment Number" value={intern.enrollment_number} />
        <InfoItem label="Department" value={intern.department_name || "N/A"} />
        <InfoItem label="Joining Date" value={new Date(intern.joining_date).toLocaleDateString()} />
        <InfoItem label="College" value="ABC Institute of Technology" /> {/* Placeholder */}
      </CardContent>
    </Card>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground uppercase">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}

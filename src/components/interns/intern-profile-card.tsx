import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import { Intern } from "@/lib/types";

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
      <CardContent className="flex flex-col md:flex-row gap-8">
        <div className="flex-shrink-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center text-primary border-4 border-primary/20">
            <span className="text-4xl font-bold">{intern.full_name.charAt(0)}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4 flex-1">
          <InfoItem label="Full Name" value={intern.full_name} />
          <InfoItem label="Email" value={intern.email} />
          <InfoItem label="Phone" value={intern.phone || "N/A"} />
          <InfoItem label="DOB" value={intern.dob || "N/A"} />
          <InfoItem label="Blood Group" value={intern.blood_group || "N/A"} />
        </div>
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

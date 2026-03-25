import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/lib/types";

interface WelcomeHeaderProps {
  name: string;
  role: UserRole;
}

export function WelcomeHeader({ name, role }: WelcomeHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hello, {name}</h1>
        <p className="text-muted-foreground mt-1">Welcome back to InternHub.</p>
      </div>
      <Badge variant="active" className="w-fit h-fit px-3 py-1 text-sm uppercase font-bold tracking-wider">
        {role.replace("_", " ")}
      </Badge>
    </div>
  );
}

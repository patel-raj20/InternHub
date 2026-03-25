import { getInternById } from "@/lib/api/interns";
import { WelcomeHeader } from "@/components/interns/welcome-header";
import { InternStatsCards } from "@/components/interns/intern-stats-cards";
import { InternProfileCard } from "@/components/interns/intern-profile-card";
import { InternAcademicCard } from "@/components/interns/intern-academic-card";
import { redirect } from "next/navigation";

export default async function InternProfilePage() {
  // In a real app, the ID would come from the auth session
  // For simulation, we'll use ID "1"
  const intern = await getInternById("1");

  if (!intern) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <WelcomeHeader name={intern.full_name} role="INTERN" />
      
      <InternStatsCards intern={intern} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-full">
          <InternProfileCard intern={intern} />
        </div>
        <div className="h-full">
          <InternAcademicCard intern={intern} />
        </div>
      </div>
    </div>
  );
}

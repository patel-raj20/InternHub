import { getInternById } from "@/lib/api/interns";
import { InternProfileCard } from "@/components/interns/intern-profile-card";
import { InternAcademicCard } from "@/components/interns/intern-academic-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface InternDetailPageProps {
  params: { id: string };
  role: "ADMIN" | "SUPER_ADMIN";
}

export default async function InternDetailPage({ params, role }: InternDetailPageProps) {
  const intern = await getInternById(params.id);

  if (!intern) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Link href={role === "SUPER_ADMIN" ? "/super-admin/interns" : "/admin/interns"}>
          <Button variant="ghost" className="gap-2 pl-0 hover:bg-transparent">
            <ArrowLeft className="w-4 h-4" /> Back to Interns
          </Button>
        </Link>
        <div className="flex justify-between items-center mt-4">
          <h1 className="text-3xl font-bold tracking-tight">{intern.full_name}</h1>
          <div className="flex gap-4">
            {role === "SUPER_ADMIN" && (
              <Link href={`/super-admin/interns/${intern.id}/edit`}>
                <Button>Edit Intern</Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <InternProfileCard intern={intern} />
        <InternAcademicCard intern={intern} />
      </div>
    </div>
  );
}

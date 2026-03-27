"use client";

import { useEffect, useState, use } from "react";
import { graphqlService } from "@/lib/services/graphql-service";
import EditInternClient from "@/components/interns/edit-intern-client";
import { Loader2 } from "lucide-react";
import { Intern, Department } from "@/lib/types";

export default function EditInternPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const internId = resolvedParams.id;
  const [data, setData] = useState<{ intern: Intern | null, departments: Department[] }>({
    intern: null,
    departments: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const intern = await graphqlService.getInternById(internId);
        if (intern) {
          const departments = await graphqlService.getDepartments(intern.organization_id);
          setData({ intern, departments });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [internId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data.intern) {
    return <div className="p-8 text-center">Intern not found</div>;
  }

  return <EditInternClient intern={data.intern} departments={data.departments} />;
}

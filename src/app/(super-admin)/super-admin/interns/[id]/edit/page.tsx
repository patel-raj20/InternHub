import { getInternById } from "@/lib/api/interns";
import { getDepartments } from "@/lib/api/departments";
import EditInternClient from "@/components/interns/edit-intern-client";
import { notFound } from "next/navigation";

export default async function EditInternPage({ params }: { params: { id: string } }) {
  const [intern, departments] = await Promise.all([
    getInternById(params.id),
    getDepartments(),
  ]);

  if (!intern) {
    notFound();
  }

  return <EditInternClient intern={intern} departments={departments} />;
}

import { getDepartments } from "@/lib/api/departments";
import CreateInternClient from "@/components/interns/create-intern-client";

export default async function CreateInternPage() {
  const departments = await getDepartments();

  return <CreateInternClient departments={departments} />;
}

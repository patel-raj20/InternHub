import { getDepartments } from "@/lib/api/departments";
import CreateInternClient from "@/components/interns/create-intern-client";

export default async function AdminCreateInternPage() {
  const departments = await getDepartments();

  return <CreateInternClient departments={departments} redirectPath="/admin/interns" title="Add Intern to Department" />;
}

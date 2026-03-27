import CreateInternClient from "@/components/interns/create-intern-client";

export default function AdminCreateInternPage() {
  return <CreateInternClient departments={[]} redirectPath="/admin/interns" title="Add Intern to Department" />;
}

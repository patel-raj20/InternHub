"use client";

import { useEffect, useState } from "react";
import { InternForm } from "@/components/forms/intern-form";
import { graphqlService } from "@/lib/services/graphql-service";
import { Intern, Department } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import toast from "react-hot-toast";

interface EditInternClientProps {
  intern: Intern;
  departments: Department[];
}

export default function EditInternClient({ intern, departments }: EditInternClientProps) {
  const router = useRouter();
  const { organization_id } = useSelector((state: RootState) => state.user);
  const [internalDepartments, setInternalDepartments] = useState<Department[]>(departments);

  useEffect(() => {
    const fetchDepts = async () => {
      if (organization_id && (!departments || departments.length === 0)) {
        try {
          const depts = await graphqlService.getDepartments(organization_id);
          setInternalDepartments(depts);
        } catch (error) {
          console.error("Failed to fetch departments:", error);
        }
      }
    };
    fetchDepts();
  }, [organization_id, departments]);

  const handleSubmit = async (data: any) => {
    try {
      // Split form data into user and intern changes
      const { 
        full_name, 
        email, 
        phone, 
        department_id, 
        status,
        user, 
        organization, 
        redirectPath,
        id: _id,
        user_id: _user_id,
        organization_id: _org_id,
        created_at: _created_at,
        updated_at: _updated_at,
        ...internData 
      } = data;
      const [first_name, ...lastNameParts] = (full_name || "").split(' ');
      const last_name = lastNameParts.join(' ');

      const userChanges = { 
        first_name, 
        last_name, 
        email, 
        phone, 
        department_id,
        status: status
      };
      
      const internChanges = {
        ...internData,
        // Ensure numeric fields are numbers
        graduation_year: internData.graduation_year ? Number(internData.graduation_year) : undefined,
        cgpa: internData.cgpa ? Number(internData.cgpa) : undefined,
      };

      await graphqlService.updateIntern(
        intern.id, 
        internChanges, 
        intern.user_id, 
        userChanges
      );
      
      toast.success("Intern updated successfully");
      router.push(data.redirectPath || "/super-admin/reports");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update intern");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString || dateString === "Present") return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().split('T')[0];
    } catch {
      return "";
    }
  };

  const initialData = {
    ...intern,
    full_name: `${intern.user?.first_name || ""} ${intern.user?.last_name || ""}`.trim(),
    email: intern.user?.email,
    phone: intern.user?.phone,
    department_id: intern.user?.department_id,
    status: intern.user?.status,
    dob: formatDate(intern.dob),
    joining_date: formatDate(intern.joining_date),
    end_date: formatDate(intern.end_date),
    enrollment_number: intern.enrollment_number || intern.id.slice(0, 8).toUpperCase(),
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Edit Intern</h1>
        <p className="text-muted-foreground mt-1">Update the profile and academic details for {initialData.full_name}.</p>
      </div>

      <InternForm 
        mode="edit" 
        initialData={initialData}
        departments={internalDepartments} 
        onSubmit={handleSubmit} 
      />
    </div>
  );
}

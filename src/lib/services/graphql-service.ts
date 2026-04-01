import { client } from "@/lib/apollo-client";
import * as Queries from "@/graphql/queries";
import * as Mutations from "@/graphql/mutations";
import { Intern, Department, Organization } from "@/lib/types";
import bcrypt from "bcryptjs";
import { getSession } from "next-auth/react";

/**
 * GraphQLService - Encapsulates all GraphQL operations.
 * Follows SOLID principles by separating data access from the UI.
 */
class GraphQLService {
  private async getAccessScope() {
    const session = await getSession();
    return {
      role: session?.user?.role,
      organization_id: session?.user?.organization_id,
      department_id: session?.user?.department_id,
    };
  }

  private isDeptAdmin(role?: string) {
    return role === "DEPT_ADMIN";
  }

  // --- Interns ---

  async getInterns(organizationId?: string, departmentId?: string): Promise<Intern[]> {
    const scope = await this.getAccessScope();
    const isDeptAdmin = this.isDeptAdmin(scope.role);
    const scopedOrganizationId = isDeptAdmin ? (scope.organization_id || organizationId) : organizationId;
    const scopedDepartmentId = isDeptAdmin ? scope.department_id : departmentId;

    if (isDeptAdmin && !scopedDepartmentId) return [];

    const { data } = await client.query<{ interns: Intern[] }>({
      query: Queries.GET_INTERNS,
      variables: {
        where: {
          ...(scopedOrganizationId ? { organization_id: { _eq: scopedOrganizationId } } : {}),
          ...(scopedDepartmentId ? { user: { department_id: { _eq: scopedDepartmentId } } } : {})
        }
      },
      fetchPolicy: "network-only",
    });
    return data?.interns || [];
  }

  async getInternById(id: string): Promise<Intern | null> {
    const scope = await this.getAccessScope();

    if (this.isDeptAdmin(scope.role)) {
      if (!scope.department_id) return null;

      const { data } = await client.query<{ interns: Intern[] }>({
        query: Queries.GET_INTERNS,
        variables: {
          where: {
            id: { _eq: id },
            user: { department_id: { _eq: scope.department_id } },
            ...(scope.organization_id ? { organization_id: { _eq: scope.organization_id } } : {}),
          },
        },
        fetchPolicy: "network-only",
      });

      return data?.interns?.[0] || null;
    }

    const { data } = await client.query<{ interns_by_pk: Intern }>({
      query: Queries.GET_INTERN_BY_ID,
      variables: { id },
      fetchPolicy: "network-only",
    });
    return data?.interns_by_pk || null;
  }

  async getInternByUserId(userId: string): Promise<Intern> {
    const { data } = await client.query<{ interns: Intern[] }>({
      query: Queries.GET_INTERN_BY_USER_ID,
      variables: { user_id: userId },
      fetchPolicy: "network-only",
    });
    return data?.interns?.[0] as Intern;
  }

  async addIntern(formData: any) {
    const scope = await this.getAccessScope();
    const isDeptAdmin = this.isDeptAdmin(scope.role);

    const organizationId = isDeptAdmin ? (scope.organization_id || formData.organization_id) : formData.organization_id;
    const departmentId = isDeptAdmin ? (scope.department_id || formData.department_id) : formData.department_id;

    if (isDeptAdmin && !departmentId) {
      throw new Error("Department admin must belong to a department");
    }

    let token = "";
    if(formData.invite_token){
      token = formData.invite_token;
    }else{
      token = bcrypt.hashSync(formData.email, 10);
    }
    
    
    const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();

    const internData: any = {
      organization_id: organizationId,
      college_name: formData.college_name,
      degree: formData.degree,
      specialization: formData.specialization,
      graduation_year: formData.graduation_year,
      cgpa: formData.cgpa,
      skills: formData.skills,
      certifications: formData.certifications,
      github_url: formData.github_url,
      linkedin_url: formData.linkedin_url,
      portfolio_url: formData.portfolio_url,
      bio: formData.bio,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      country: formData.country,
      joining_date: formData.joining_date || new Date().toISOString(),
      end_date: formData.end_date,
    };

    if (formData.full_name) {
      const [first_name, ...lastNameParts] = formData.full_name.split(' ');
      const last_name = lastNameParts.join(' ');

      internData.user = {
        data: {
          organization_id: organizationId,
          department_id: departmentId,
          first_name,
          last_name,
          email: formData.email,
          phone: formData.phone,
          role: "INTERN",
          status: "ACTIVE",

          invite_status: "PENDING",
          invite_token: token,
          invite_expires_at: expiresAt,
          password_hash: "" // Placeholder, should be replaced with actual hashed password logic
        }
      };
    }

    const { data } = await client.mutate({
      mutation: Mutations.INSERT_INTERN,
      variables: { object: internData },
    });
    
    if (formData.full_name && formData.email) {
      const first_name = formData.full_name.split(' ')[0];

      try {
        await fetch('/api/invite/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            firstName: first_name,
            token: token
          })
        });
      } catch (err) {
        console.error("Failed to trigger invite email", err);
      }
    }

    return data;
  }

  async updateIntern(id: string, internChanges: any, userId: string, userChanges: any) {
    const scope = await this.getAccessScope();
    if (this.isDeptAdmin(scope.role)) {
      const allowedIntern = await this.getInternById(id);
      if (!allowedIntern) {
        throw new Error("Unauthorized department access");
      }

      if (scope.department_id) {
        userChanges = { ...userChanges, department_id: scope.department_id };
      }
    }

    const { data } = await client.mutate({
      mutation: Mutations.UPDATE_INTERN,
      variables: { id, internChanges, userId, userChanges },
    });
    return data;
  }

  async deleteIntern(id: string, userId: string) {
    const scope = await this.getAccessScope();
    if (this.isDeptAdmin(scope.role)) {
      const allowedIntern = await this.getInternById(id);
      if (!allowedIntern) {
        throw new Error("Unauthorized department access");
      }
    }

    const { data } = await client.mutate({
      mutation: Mutations.DELETE_INTERN,
      variables: { id, userId },
    });
    return data;
  }

  // --- Departments ---

  async getDepartments(orgId: string): Promise<Department[]> {
    const scope = await this.getAccessScope();
    const isDeptAdmin = this.isDeptAdmin(scope.role);
    const scopedOrgId = isDeptAdmin ? (scope.organization_id || orgId) : orgId;

    if (!scopedOrgId) return [];

    const { data } = await client.query<{ departments: any[] }>({
      query: Queries.GET_DEPARTMENTS,
      variables: { organization_id: scopedOrgId },
      fetchPolicy: "network-only",
    });
    const departments = (data?.departments || []).map((dept: any) => ({
      ...dept,
      intern_count: dept.users_aggregate?.aggregate?.count || 0,
      head: dept.users?.[0] || null
    }));

    if (isDeptAdmin) {
      return departments.filter((dept: any) => dept.id === scope.department_id);
    }

    return departments;
  }

  async addDepartment(formData: any) {
    const deptData: any = {
      organization_id: formData.organization_id,
      name: formData.name,
      description: formData.description,
      users: {
        data: [
          {
            organization_id: formData.organization_id,
            first_name: formData.adminFirstName || "Dept",
            last_name: formData.adminLastName || "Admin",
            email: formData.adminEmail,
            password_hash: "hashed_pass",
            role: "DEPT_ADMIN",
            status: "ACTIVE",
            invite_status: "ACCEPTED",
          }
        ]
      }
    };

    const { data } = await client.mutate({
      mutation: Mutations.INSERT_DEPARTMENT,
      variables: { object: deptData },
    });
    return data;
  }

  async updateDepartment(id: string, set: any) {
    const { data } = await client.mutate({
      mutation: Mutations.UPDATE_DEPARTMENT,
      variables: { id, set },
    });
    return data;
  }

  // --- Organizations ---

  async getOrganizations(): Promise<Organization[]> {
    const { data } = await client.query<{ organizations: Organization[] }>({
      query: Queries.GET_ORGANIZATIONS,
    });
    return data?.organizations || [];
  }

  async getOrganizationById(id: string): Promise<Organization> {
    const { data } = await client.query<{ organizations_by_pk: Organization }>({
      query: Queries.GET_ORGANIZATION_BY_ID,
      variables: { id },
      fetchPolicy: "network-only",
    });
    return data?.organizations_by_pk as Organization;
  }

  async addOrganization(object: any) {
    const { data } = await client.mutate({
      mutation: Mutations.INSERT_ORGANIZATION,
      variables: { object },
    });
    return data;
  }

  async updateOrganization(id: string, set: any) {
    const { data } = await client.mutate({
      mutation: Mutations.UPDATE_ORGANIZATION,
      variables: { id, set },
    });
    return data;
  }

  async deleteOrganization(id: string) {
    const { data } = await client.mutate({
      mutation: Mutations.DELETE_ORGANIZATION,
      variables: { id },
    });
    return data;
  }

  async deleteDepartment(id: string) {
    const { data } = await client.mutate({
      mutation: Mutations.DELETE_DEPARTMENT,
      variables: { id },
    });
    return data;
  }
  async getGlobalStats() {
    const { data } = await client.query({
      query: Queries.GET_GLOBAL_STATS,
      fetchPolicy: "network-only",
    });
    return {
      organizations: data?.organizations_aggregate?.aggregate?.count || 0,
      departments: data?.departments_aggregate?.aggregate?.count || 0,
      interns: data?.interns_aggregate?.aggregate?.count || 0,
      activeInterns: data?.active_interns?.aggregate?.count || 0,
    };
  }

  async getAllDepartments(): Promise<Department[]> {
    const { data } = await client.query<{ departments: any[] }>({
      query: Queries.GET_ALL_DEPARTMENTS,
      fetchPolicy: "network-only",
    });
    return (data?.departments || []).map((dept: any) => ({
      ...dept,
      intern_count: dept.users_aggregate?.aggregate?.count || 0,
    }));
  }
}

export const graphqlService = new GraphQLService();
export default graphqlService;

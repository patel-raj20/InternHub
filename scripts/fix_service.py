import os

path = r'e:\Intern_Hub\InternHub\src\lib\services\graphql-service.ts'
content = r"""import { client } from "@/lib/apollo-client";
import * as Queries from "@/graphql/queries";
import * as Mutations from "@/graphql/mutations";
import { Intern, Department, Organization, AttendanceSettings, AttendanceRecord } from "@/lib/types";
import bcrypt from "bcryptjs";
import { removeTypename } from "@/lib/utils";
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

    const rawPass = formData.password || Math.random().toString(36).slice(-8);
    const passHash = bcrypt.hashSync(rawPass, 10);

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
      dob: formData.dob,
      blood_group: formData.blood_group,
      enrollment_number: formData.enrollment_number,
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
          status: formData.status || "ACTIVE",
          invite_status: "ACCEPTED",
          invite_token: null,
          invite_expires_at: null,
          password_hash: passHash,
          created_by: formData.createdBy || null
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
            rawPassword: rawPass
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
      variables: {
        id,
        internChanges: removeTypename(internChanges),
        userId,
        userChanges: removeTypename(userChanges)
      },
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
      variables: { where: { organization_id: { _eq: scopedOrgId } } },
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
    const rawPass = formData.adminPassword || Math.random().toString(36).slice(-8);
    const passHash = bcrypt.hashSync(rawPass, 10);
    
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
            password_hash: passHash,
            role: "DEPT_ADMIN",
            status: "ACTIVE",
            invite_status: "ACCEPTED",
            created_by: formData.createdBy || null
          }
        ]
      }
    };

    const { data } = await client.mutate({
      mutation: Mutations.INSERT_DEPARTMENT,
      variables: { object: deptData },
    });
    
    if (formData.adminEmail) {
      try {
        await fetch('/api/invite/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.adminEmail,
            firstName: formData.adminFirstName || "Dept",
            rawPassword: rawPass
          })
        });
      } catch (err) {
        console.error("Failed to trigger welcome email", err);
      }
    }
    
    return data;
  }

  async updateDepartment(id: string, set: any) {
    const { data } = await client.mutate({
      mutation: Mutations.UPDATE_DEPARTMENT,
      variables: { id, set: removeTypename(set) },
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

  async addOrganization(formData: any) {
    const rawPass = formData.adminPassword || Math.random().toString(36).slice(-8);
    const passHash = bcrypt.hashSync(rawPass, 10);
    
    const orgData: any = {
      name: formData.name,
      description: formData.description,
      industry: formData.industry,
      website: formData.website,
      logo_url: formData.logo_url,
      users: {
        data: [
          {
            first_name: formData.adminFirstName,
            last_name: formData.adminLastName,
            email: formData.adminEmail,
            password_hash: passHash,
            role: "SUPER_ADMIN",
            status: "ACTIVE",
            invite_status: "ACCEPTED",
            created_by: formData.createdBy || null
          }
        ]
      }
    };

    const { data } = await client.mutate({
      mutation: Mutations.INSERT_ORGANIZATION,
      variables: { object: orgData },
    });
    
    if (formData.adminEmail) {
      try {
        await fetch('/api/invite/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.adminEmail,
            firstName: formData.adminFirstName || "Super",
            rawPassword: rawPass
          })
        });
      } catch (err) {
        console.error("Failed to trigger welcome email", err);
      }
    }
    
    return data;
  }

  async updateOrganization(id: string, set: any) {
    const { data } = await client.mutate({
      mutation: Mutations.UPDATE_ORGANIZATION,
      variables: { id, set: removeTypename(set) },
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
    const { data } = await client.query<any>({
      query: Queries.GET_GLOBAL_STATS,
      fetchPolicy: "network-only",
    });
    return {
      organizations: (data as any)?.organizations_aggregate?.aggregate?.count || 0,
      departments: (data as any)?.departments_aggregate?.aggregate?.count || 0,
      interns: (data as any)?.interns_aggregate?.aggregate?.count || 0,
      activeInterns: (data as any)?.active_interns?.aggregate?.count || 0,
    };
  }

  async getAllDepartments(): Promise<Department[]> {
    const { data } = await client.query<{ departments: any[] }>({
      query: Queries.GET_ALL_DEPARTMENTS,
      fetchPolicy: "network-only",
    });
    return (data?.departments || []).map((dept: any) => ({
      ...dept,
      head: dept.users?.[0] || null,
      intern_count: dept.users_aggregate?.aggregate?.count || 0,
    }));
  }

  // --- Attendance ---

  async getAttendanceSettings(departmentId: string): Promise<AttendanceSettings | null> {
    const { data } = await client.query<{ attendance_settings: AttendanceSettings[] }>({
      query: Queries.GET_ATTENDANCE_SETTINGS,
      variables: { department_id: departmentId },
      fetchPolicy: "network-only",
    });
    return data?.attendance_settings?.[0] || null;
  }

  async upsertAttendanceSettings(settings: Partial<AttendanceSettings>) {
    const { data } = await client.mutate<{ insert_attendance_settings_one: AttendanceSettings }>({
      mutation: Mutations.UPSERT_ATTENDANCE_SETTINGS,
      variables: { object: removeTypename(settings) },
    });
    return data?.insert_attendance_settings_one;
  }

  async markAttendance(record: Partial<AttendanceRecord>) {
    const { data } = await client.mutate<{ insert_attendance_records_one: AttendanceRecord }>({
      mutation: Mutations.INSERT_ATTENDANCE_RECORD,
      variables: { object: record },
    });
    return data?.insert_attendance_records_one;
  }

  async getInternAttendance(internId: string): Promise<AttendanceRecord[]> {
    const { data } = await client.query<{ attendance_records: AttendanceRecord[] }>({
      query: Queries.GET_INTERN_ATTENDANCE,
      variables: { intern_id: internId },
      fetchPolicy: "network-only",
    });
    return data?.attendance_records || [];
  }

  async getDailyAttendanceReport(departmentId: string, date: string): Promise<AttendanceRecord[]> {
    const { data } = await client.query<{ attendance_records: AttendanceRecord[] }>({
      query: Queries.GET_DAILY_ATTENDANCE_REPORT,
      variables: { department_id: departmentId, date },
      fetchPolicy: "network-only",
    });
    return data?.attendance_records || [];
  }

  async updateInternStreak(id: string, set: any) {
    const { data } = await client.mutate({
      mutation: Mutations.UPDATE_INTERN_STREAK,
      variables: { id, set: removeTypename(set) },
    });
    return data;
  }

  async awardBadge(internId: string, badgeId: string) {
    const { data } = await client.mutate({
      mutation: Mutations.AWARD_BADGE,
      variables: {
        object: {
          intern_id: internId,
          badge_id: badgeId
        }
      },
    });
    return data;
  }

  async getBadges() {
    const { data } = await client.query<any>({
      query: Queries.GET_BADGES,
      fetchPolicy: "network-only",
    });
    return data?.badges || [];
  }

  async batchAttendanceUpdate(variables: any) {
    const { data } = await client.mutate({
      mutation: Mutations.BATCH_ATTENDANCE_UPDATE,
      variables: removeTypename({
        ...variables,
        hasBadge: !!variables.badgeObject
      }),
    });
    return data;
  }

  // --- Tasks & Gamification ---

  async getTaskById(id: string) {
    const { data } = await client.query<any>({
      query: Queries.GET_TASK_BY_ID,
      variables: { id },
      fetchPolicy: "network-only",
    });
    return data?.tasks_by_pk || null;
  }

  async batchTaskCompletion(variables: any) {
    const { data } = await client.mutate({
      mutation: Mutations.BATCH_TASK_COMPLETION,
      variables: removeTypename({
        ...variables,
        hasBadge: !!variables.badgeObject
      }),
    });
    return data;
  }

  async batchInsertTasks(taskObjects: any[]) {
    const { data } = await client.mutate({
      mutation: Mutations.INSERT_TASKS,
      variables: { objects: taskObjects.map(removeTypename) },
    });
    return data;
  }


  async getAllTasks(where: any = {}) {
    const { data } = await client.query<any>({
      query: Queries.GET_ALL_TASKS,
      variables: { where },
      fetchPolicy: "network-only",
    });
    return data?.tasks || [];
  }

  async getLeaderboard(departmentId?: string, limit: number = 10) {
    const where: any = {
      user: { status: { _eq: "ACTIVE" } }
    };

    if (departmentId && departmentId !== "null") {
      where.user.department_id = { _eq: departmentId };
    }

    const { data } = await client.query<any>({
      query: Queries.GET_LEADERBOARD,
      variables: { limit, where },
      fetchPolicy: "network-only",
    });
    return data?.interns || [];
  }

  // --- Departmental Tasks ---

  async getDepartmentTasksForSuperAdmin(organization_id: string) {
    const { data } = await client.query<any>({
      query: Queries.GET_DEPARTMENT_TASKS_FOR_SUPERADMIN,
      variables: { organization_id },
      fetchPolicy: "network-only",
    });
    return data?.department_tasks || [];
  }

  async getDepartmentTasksForAdmin(department_id: string) {
    const { data } = await client.query<any>({
      query: Queries.GET_DEPARTMENT_TASKS_FOR_ADMIN,
      variables: { department_id },
      fetchPolicy: "network-only",
    });
    return data?.department_tasks || [];
  }

  async getDepartmentTaskById(id: string) {
    const { data } = await client.query<any>({
      query: Queries.GET_DEPARTMENT_TASK_BY_ID,
      variables: { id },
      fetchPolicy: "network-only",
    });
    return data?.department_tasks_by_pk || null;
  }

  async insertDepartmentTask(object: any) {
    const { data } = await client.mutate<any>({
      mutation: Mutations.INSERT_DEPARTMENT_TASK,
      variables: { object: removeTypename(object) },
    });
    return data?.insert_department_tasks_one;
  }

  async batchInsertDepartmentTasks(taskObjects: any[]) {
    const { data } = await client.mutate<any>({
      mutation: Mutations.INSERT_DEPARTMENT_TASKS,
      variables: { objects: taskObjects.map(removeTypename) },
    });
    return data?.insert_department_tasks;
  }

  async getSubtasksProgress(parent_id: string) {
    const { data } = await client.query<any>({
      query: Queries.GET_SUBTASKS_PROGRESS,
      variables: { parent_id },
      fetchPolicy: "network-only",
    });
    return data?.tasks || [];
  }

  async getInternTasks(intern_id: string) {
    const { data } = await client.query<any>({
      query: Queries.GET_INTERN_TASKS,
      variables: { intern_id },
      fetchPolicy: "network-only",
    });
    return data?.tasks || [];
  }

  async updateDepartmentTaskStatus(id: string, status: string) {
    const { data } = await client.mutate<any>({
      mutation: Mutations.UPDATE_DEPARTMENT_TASK_STATUS,
      variables: { id, status },
    });
    return data?.update_department_tasks_by_pk;
  }

  async deleteDepartmentTask(id: string) {
    const { data } = await client.mutate<any>({
      mutation: Mutations.DELETE_DEPARTMENT_TASK,
      variables: { id },
    });
    return data?.delete_department_tasks_by_pk;
  }

  async getMasterTasks(organization_id: string) {
    const { data } = await client.query<any>({
      query: Queries.GET_MASTER_TASKS,
      variables: { organization_id },
      fetchPolicy: "network-only",
    });
    return data?.master_tasks || [];
  }

  async getMasterTaskDetail(id: string) {
    const { data } = await client.query<any>({
      query: Queries.GET_MASTER_TASK_DETAIL,
      variables: { id },
      fetchPolicy: "network-only",
    });
    return data?.master_tasks_by_pk;
  }

  async createMasterTask(object: {
    organization_id: string;
    title: string;
    description: string;
    deadline: string;
    created_by: string;
    department_ids: string[];
  }) {
    const { data } = await client.mutate<any>({
      mutation: Mutations.INSERT_MASTER_TASK,
      variables: {
        object: {
          organization_id: object.organization_id,
          title: object.title,
          description: object.description,
          deadline: object.deadline,
          created_by: object.created_by,
          department_tasks: {
            data: object.department_ids.map((department_id) => ({
              department_id,
              organization_id: object.organization_id,
              created_by: object.created_by,
              status: "PENDING",
            })),
          },
        },
      },
    });
    return data?.insert_master_tasks_one;
  }

  async deleteMasterTask(id: string) {
    const { data } = await client.mutate<any>({
      mutation: Mutations.DELETE_MASTER_TASK,
      variables: { id },
    });
    return data?.delete_master_tasks_by_pk;
  }
}

export const graphqlService = new GraphQLService();
export default graphqlService;
"""

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print(f"Successfully wrote {len(content)} bytes to {path}")

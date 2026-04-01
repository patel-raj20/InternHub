import { client } from "@/lib/apollo-client";
import * as Queries from "@/graphql/queries";
import * as Mutations from "@/graphql/mutations";
import { Intern, Department, Organization, AttendanceSettings, AttendanceRecord } from "@/lib/types";
import bcrypt from "bcryptjs";
import { removeTypename } from "@/lib/utils";

/**
 * GraphQLService - Encapsulates all GraphQL operations.
 * Follows SOLID principles by separating data access from the UI.
 */
class GraphQLService {
  // --- Interns ---

  async getInterns(organizationId?: string, departmentId?: string): Promise<Intern[]> {
    const { data } = await client.query<{ interns: Intern[] }>({
      query: Queries.GET_INTERNS,
      variables: {
        where: {
          ...(organizationId ? { organization_id: { _eq: organizationId } } : {}),
          ...(departmentId ? { user: { department_id: { _eq: departmentId } } } : {})
        }
      },
      fetchPolicy: "network-only",
    });
    return data?.interns || [];
  }

  async getInternById(id: string): Promise<Intern> {
    const { data } = await client.query<{ interns_by_pk: Intern }>({
      query: Queries.GET_INTERN_BY_ID,
      variables: { id },
      fetchPolicy: "network-only",
    });
    return data?.interns_by_pk as Intern;
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
    let token = "";
    if (formData.invite_token) {
      token = formData.invite_token;
    } else {
      token = bcrypt.hashSync(formData.email, 10);
    }


    const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();

    const internData: any = {
      organization_id: formData.organization_id,
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
          organization_id: formData.organization_id,
          department_id: formData.department_id,
          first_name,
          last_name,
          email: formData.email,
          phone: formData.phone,
          role: "INTERN",
          status: formData.status || "ACTIVE",
          invite_status: "PENDING",
          invite_token: token,
          invite_expires_at: expiresAt,
          password_hash: formData.password ? bcrypt.hashSync(formData.password, 10) : "",
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
    const { data } = await client.mutate({
      mutation: Mutations.DELETE_INTERN,
      variables: { id, userId },
    });
    return data;
  }

  // async getInterns(orgId: string, deptId?: string) {
  //     const where: any = { organization_id: { _eq: orgId } };
  //     if (deptId) {
  //       where.user = { department_id: { _eq: deptId } };
  //     }
  //     const { data } = await client.query({
  //       query: Queries.GET_INTERNS,
  //       variables: { where },
  //       fetchPolicy: "network-only",
  //     });
  //     return data?.interns || [];
  //   }

  // async getInternByUserId(userId: string) {
  //   const { data } = await client.query({
  //     query: Queries.GET_INTERNS,
  //     variables: { where: { user_id: { _eq: userId } } },
  //     fetchPolicy: "network-only",
  //   });
  //   return data?.interns?.[0] || null;
  // }

  // async getInternById(id: string) {
  //   const { data } = await client.query({
  //     query: Queries.GET_INTERN_BY_ID,
  //     variables: { id },
  //     fetchPolicy: "network-only",
  //   });
  //   return data?.interns_by_pk || null;
  // }

  // --- Departments ---

  async getDepartments(orgId: string): Promise<Department[]> {
    const { data } = await client.query<{ departments: any[] }>({
      query: Queries.GET_DEPARTMENTS,
      variables: { where: { organization_id: { _eq: orgId } } },
      fetchPolicy: "network-only",
    });
    return (data?.departments || []).map((dept: any) => ({
      ...dept,
      intern_count: dept.users_aggregate?.aggregate?.count || 0,
      head: dept.users?.[0] || null
    }));
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
            password_hash: formData.adminPassword ? bcrypt.hashSync(formData.adminPassword, 10) : "hashed_pass",
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
            password_hash: formData.adminPassword ? bcrypt.hashSync(formData.adminPassword, 10) : "",
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
      variables: { object: settings },
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
      query: Mutations.GET_BADGES_QUERY,
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

  async getTasks(internId: string) {
    const { data } = await client.query<any>({
      query: Queries.GET_TASKS,
      variables: { intern_id: internId },
      fetchPolicy: "network-only",
    });
    return data?.tasks || [];
  }

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

  // async getInternTasks(internId: string) {
  //   const { data } = await client.query<any>({
  //     query: Queries.GET_TASKS,
  //     variables: { intern_id: internId },
  //     fetchPolicy: "network-only",
  //   });
  //   return data?.tasks || [];
  // }

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
}

export const graphqlService = new GraphQLService();
export default graphqlService;

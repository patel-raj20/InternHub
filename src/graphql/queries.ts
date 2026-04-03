import { gql } from "@apollo/client";

export const GET_ORGANIZATIONS = gql`
  query GetOrganizations {
    organizations {
      id
      name
      description
      industry
      website
      logo_url
      created_at
    }
  }
`;

export const GET_DEPARTMENTS = gql`
  query GetDepartments($where: departments_bool_exp) {
    departments(where: $where) {
      id
      name
      description
      organization_id
      created_at
      users(where: { role: { _eq: "DEPT_ADMIN" } }) {
        id
        first_name
        last_name
        email
      }
      users_aggregate(where: { role: { _eq: "INTERN" } }) {
        aggregate {
          count
        }
      }
    }
  }
`;

export const GET_INTERNS = gql`
  query GetInterns($where: interns_bool_exp) {
    interns(where: $where, order_by: { created_at: desc }) {
      id
      user_id
      organization_id
      organization {
        id
        name
      }
      college_name
      degree
      specialization
      graduation_year
      cgpa
      skills
      certifications
      github_url
      linkedin_url
      portfolio_url
      bio
      address
      city
      state
      country
      dob
      blood_group
      enrollment_number
      joining_date
      end_date
      created_at
      streak
      longest_streak
      longest_streak_start
      longest_streak_end
      total_points
      last_attendance
      task_streak
      longest_task_streak
      last_task_date
      intern_badges {
        earned_at
        badge {
          id
          name
          icon
          description
        }
      }
      user {
        id
        first_name
        last_name
        email
        phone
        status
        role
        department_id
        department {
          id
          name
        }
      }
    }
  }
`;

export const GET_INTERN_BY_ID = gql`
  query GetInternById($id: uuid!) {
    interns_by_pk(id: $id) {
      id
      user_id
      organization_id
      organization {
        id
        name
      }
      college_name
      degree
      specialization
      graduation_year
      cgpa
      skills
      certifications
      github_url
      linkedin_url
      portfolio_url
      bio
      address
      city
      state
      country
      dob
      blood_group
      enrollment_number
      joining_date
      end_date
      created_at
      streak
      longest_streak
      longest_streak_start
      longest_streak_end
      total_points
      last_attendance
      task_streak
      longest_task_streak
      last_task_date
      intern_badges {
        earned_at
        badge {
          id
          name
          icon
          description
        }
      }

      user {
        id
        first_name
        last_name
        email
        phone
        role
        status
        department_id
        department {
          id
          name
          users(where: { role: { _eq: "DEPT_ADMIN" } }) {
            id
            first_name
            last_name
            email
          }
        }
      }
    }
  }
`;

export const GET_ORGANIZATION_BY_ID = gql`
  query GetOrganizationById($id: uuid!) {
    organizations_by_pk(id: $id) {
      id
      name
      description
      industry
      website
      logo_url
      created_at
    }
  }
`;

export const GET_INTERN_BY_USER_ID = gql`
  query GetInternByUserId($user_id: uuid!) {
    interns(where: { user_id: { _eq: $user_id } }) {
      id
      user_id
      organization_id
      organization {
        id
        name
      }
      college_name
      degree
      specialization
      graduation_year
      cgpa
      skills
      certifications
      github_url
      linkedin_url
      portfolio_url
      bio
      address
      city
      state
      country
      dob
      blood_group
      enrollment_number
      joining_date
      end_date
      created_at
      streak
      longest_streak
      longest_streak_start
      longest_streak_end
      total_points
      last_attendance
      task_streak
      longest_task_streak
      last_task_date
      intern_badges {
        earned_at
        badge {
          id
          name
          icon
          description
        }
      }

      user {
        id
        first_name
        last_name
        email
        phone
        role
        status
        department_id
        department {
          id
          name
          users(where: { role: { _eq: "DEPT_ADMIN" } }) {
            id
            first_name
            last_name
            email
          }
        }
      }
    }
  }
`;

export const GET_GLOBAL_STATS = gql`
  query GetGlobalStats {
    organizations_aggregate {
      aggregate {
        count
      }
    }
    departments_aggregate {
      aggregate {
        count
      }
    }
    interns_aggregate {
      aggregate {
        count
      }
    }
    active_interns: interns_aggregate(where: { user: { status: { _eq: "ACTIVE" } } }) {
      aggregate {
        count
      }
    }
  }
`;

export const GET_ALL_DEPARTMENTS = gql`
  query GetAllDepartments {
    departments {
      id
      name
      organization_id
      organization {
        id
        name
      }
      users(where: { role: { _eq: "DEPT_ADMIN" } }) {
        id
        first_name
        last_name
        email
      }
      users_aggregate(where: { role: { _eq: "INTERN" } }) {
        aggregate {
          count
        }
      }
    }
  }
`;

export const GET_USER_BY_TOKEN = gql`
  query GetUserByToken($token: String!) {
    users(where: { invite_token: { _eq: $token } }) {
      id
      invite_status
      invite_expires_at
    }
  }
`;

export const GET_USER_BY_EMAIL = gql`
  query GetUserByEmail($email: String!) {
    users(where: { email: { _eq: $email } }) {
      id
      first_name
      last_name
      email
      role
      organization_id
      department_id
    }
  }
`;

export const GET_ATTENDANCE_SETTINGS = gql`
  query GetAttendanceSettings($department_id: uuid!) {
    attendance_settings(where: { department_id: { _eq: $department_id } }) {
      id
      department_id
      office_lat
      office_lng
      allowed_radius_meters
      work_start_time
      late_threshold_minutes
      updated_at
    }
  }
`;

export const GET_INTERN_ATTENDANCE = gql`
  query GetInternAttendance($intern_id: uuid!) {
    attendance_records(where: { intern_id: { _eq: $intern_id } }, order_by: { date: desc }) {
      id
      date
      check_in_time
      status
      distance_meters
    }
  }
`;

export const GET_DAILY_ATTENDANCE_REPORT = gql`
  query GetDailyAttendanceReport($department_id: uuid!, $date: date!) {
    attendance_records(
      where: { 
        intern: { user: { department_id: { _eq: $department_id } } },
        date: { _eq: $date }
      }
    ) {
      id
      intern_id
      intern {
        user {
          first_name
          last_name
          email
        }
      }
      check_in_time
      status
      distance_meters
    }
  }
`;

export const GET_TASKS = gql`
  query GetTasks($intern_id: uuid!) {
    tasks(where: { intern_id: { _eq: $intern_id } }, order_by: { deadline: asc }) {
      id
      title
      description
      status
      category
      difficulty
      points_reward
      deadline
      completed_at
      parent_dept_task_id
      created_at
    }
  }
`;

export const GET_TASK_BY_ID = gql`
  query GetTaskById($id: uuid!) {
    tasks_by_pk(id: $id) {
      id
      intern_id
      title
      description
      status
      category
      difficulty
      points_reward
      deadline
      completed_at
    }
  }
`;

export const GET_LEADERBOARD = gql`
  query GetLeaderboard($limit: Int = 10, $where: interns_bool_exp) {
    interns(
      limit: $limit,
      order_by: { total_points: desc },
      where: $where
    ) {
      id
      total_points
      task_streak
      user {
        first_name
        last_name
        department {
          name
        }
      }
      intern_badges {
        badge {
          icon
          name
        }
      }
    }
  }
`;

export const GET_ALL_TASKS = gql`
  query GetAllTasks($where: tasks_bool_exp) {
    tasks(where: $where, order_by: { created_at: desc }) {
      id
      title
      description
      status
      category
      difficulty
      points_reward
      deadline
      completed_at
      parent_dept_task_id
      created_at
      intern_id
      intern {
        id
        user {
          id
          first_name
          last_name
          email
          department_id
          department {
            id
            name
          }
        }
      }
    }
  }
`;

export const GET_USER_FOR_RESET = gql`
  query GetUserForReset($email: String!) {
    users(where: { email: { _eq: $email } }) {
      id
      email
      reset_otp
      reset_otp_expires_at
    }
  }
`;

export const GET_MASTER_TASKS = gql`
  query GetMasterTasks($organization_id: uuid!) {
    master_tasks(
      where: { organization_id: { _eq: $organization_id } }
      order_by: { created_at: desc }
    ) {
      id
      title
      description
      deadline
      status
      created_at
      department_tasks {
        id
        department_id
        status
        tasks {
          id
          status
        }
      }
    }
  }
`;

export const GET_MASTER_TASK_DETAIL = gql`
  query GetMasterTaskDetail($id: uuid!) {
    master_tasks_by_pk(id: $id) {
      id
      title
      description
      deadline
      status
      created_at
      department_tasks {
        id
        department_id
        status
        tasks(order_by: { created_at: desc }) {
          id
          title
          status
          completed_at
          intern {
            id
            user {
              first_name
              last_name
              email
            }
          }
        }
      }
    }
  }
`;

export const GET_DEPARTMENT_TASKS_FOR_SUPERADMIN = gql`
  query GetDepartmentTasksForSuperAdmin($organization_id: uuid!) {
    department_tasks(where: { organization_id: { _eq: $organization_id } }, order_by: { created_at: desc }) {
      id
      department_id
      master_task_id
      title
      description
      status
      deadline
      created_at
      tasks {
        id
        status
      }
    }
  }
`;

export const GET_DEPARTMENT_TASKS_FOR_ADMIN = gql`
  query GetDepartmentTasksForAdmin($department_id: uuid!) {
    department_tasks(where: { department_id: { _eq: $department_id } }, order_by: { created_at: desc }) {
      id
      master_task_id
      title
      description
      status
      deadline
      created_at
      master_task {
        id
        title
        description
        deadline
      }
    }
  }
`;

export const GET_SUBTASKS_PROGRESS = gql`
  query GetSubtasksProgress($parent_id: uuid!) {
    tasks(where: { parent_dept_task_id: { _eq: $parent_id } }) {
      id
      status
      completed_at
      intern {
        id
        user {
          first_name
          last_name
          email
        }
      }
    }
  }
`;

export const GET_INTERN_TASKS = gql`
  query GetInternTasks($intern_id: uuid!) {
    tasks(where: { intern_id: { _eq: $intern_id } }, order_by: { created_at: desc }) {
      id
      title
      description
      category
      difficulty
      points_reward
      deadline
      status
      completed_at
      created_at
      parent_dept_task_id
      department_task {
        id
        title
        description
        deadline
        master_task {
          id
          title
          description
          deadline
        }
      }
    }
  }
`;

export const GET_DEPARTMENT_TASK_BY_ID = gql`
  query GetDepartmentTaskById($id: uuid!) {
    department_tasks_by_pk(id: $id) {
      id
      department_id
      master_task_id
      title
      description
      status
      deadline
      created_at
      master_task {
        id
        title
        description
        deadline
      }
      tasks {
        id
        status
      }
    }
  }
`;

export const GET_BADGES = gql`
  query GetBadges {
    badges {
      id
      name
      icon
      description
      milestone_days
    }
  }
`;

import { gql } from "@apollo/client";

export const INSERT_ORGANIZATION = gql`
  mutation InsertOrganization($object: organizations_insert_input!) {
    insert_organizations_one(object: $object) {
      id
      name
    }
  }
`;

export const UPDATE_ORGANIZATION = gql`
  mutation UpdateOrganization($id: uuid!, $set: organizations_set_input!) {
    update_organizations_by_pk(pk_columns: {id: $id}, _set: $set) {
      id
      name
    }
  }
`;

export const INSERT_DEPARTMENT = gql`
  mutation InsertDepartment($object: departments_insert_input!) {
    insert_departments_one(object: $object) {
      id
      name
      organization_id
    }
  }
`;

export const UPDATE_DEPARTMENT = gql`
  mutation UpdateDepartment($id: uuid!, $set: departments_set_input!) {
    update_departments_by_pk(pk_columns: {id: $id}, _set: $set) {
      id
      name
    }
  }
`;

/**
 * Inserts a User and an associated Intern record.
 * Hasura/GraphQL typically allows nested inserts if relationships are set.
 */
export const INSERT_INTERN = gql`
  mutation InsertIntern($object: interns_insert_input!) {
    insert_interns_one(object: $object) {
      id
      user_id
      organization_id
    }
  }
`;

export const UPDATE_INTERN = gql`
  mutation UpdateIntern($id: uuid!, $internChanges: interns_set_input!, $userId: uuid!, $userChanges: users_set_input!) {
    update_interns_by_pk(pk_columns: {id: $id}, _set: $internChanges) {
      id
    }
    update_users_by_pk(pk_columns: {id: $userId}, _set: $userChanges) {
      id
    }
  }
`;

export const UPDATE_USER_STATUS = gql`
  mutation UpdateUserStatus($id: uuid!, $status: String!) {
    update_users_by_pk(pk_columns: {id: $id}, _set: {status: $status}) {
      id
      status
    }
  }
`;

export const DELETE_INTERN = gql`
  mutation DeleteIntern($id: uuid!, $userId: uuid!) {
    delete_interns_by_pk(id: $id) {
      id
    }
    delete_users_by_pk(id: $userId) {
      id
    }
  }
`;

export const DELETE_ORGANIZATION = gql`
  mutation DeleteOrganization($id: uuid!) {
    delete_organizations_by_pk(id: $id) {
      id
    }
  }
`;

export const DELETE_DEPARTMENT = gql`
  mutation DeleteDepartment($id: uuid!) {
    delete_departments_by_pk(id: $id) {
      id
    }
  }
`;

// mutations.ts
export const UPDATE_USER_INVITE = gql`
mutation UpdateUserInvite($id: uuid!, $token: String!, $expires_at: timestamptz!) {
  update_users_by_pk(
    pk_columns: { id: $id }
    _set: {
      invite_token: $token
      invite_expires_at: $expires_at
      invite_status: "PENDING"
    }
  ) {
    id
    email
    invite_status
  }
}
`;

export const ACCEPT_INVITE = gql`
mutation AcceptInvite($id: uuid!, $password: String!) {
  update_users_by_pk(
    pk_columns: { id: $id }
    _set: {
      password_hash: $password
      invite_status: "ACCEPTED"
      invite_token: null
      invite_expires_at: null
    }
  ) {
    id
  }
}
`;

export const UPSERT_ATTENDANCE_SETTINGS = gql`
  mutation UpsertAttendanceSettings($object: attendance_settings_insert_input!) {
    insert_attendance_settings_one(
      object: $object,
      on_conflict: {
        constraint: attendance_settings_department_id_key,
        update_columns: [office_lat, office_lng, allowed_radius_meters, work_start_time, late_threshold_minutes, updated_at]
      }
    ) {
      id
      department_id
    }
  }
`;

export const INSERT_ATTENDANCE_RECORD = gql`
  mutation InsertAttendanceRecord($object: attendance_records_insert_input!) {
    insert_attendance_records_one(object: $object) {
      id
      status
      check_in_time
    }
  }
`;

export const UPDATE_INTERN_STREAK = gql`
  mutation UpdateInternStreak($id: uuid!, $set: interns_set_input!) {
    update_interns_by_pk(pk_columns: {id: $id}, _set: $set) {
      id
      streak
      longest_streak
      total_points
    }
  }
`;

export const AWARD_BADGE = gql`
  mutation AwardBadge($object: intern_badges_insert_input!) {
    insert_intern_badges_one(
      object: $object,
      on_conflict: {
        constraint: intern_badges_intern_id_badge_id_key,
        update_columns: [earned_at]
      }
    ) {
      id
      badge {
        name
      }
    }
  }
`;

export const BATCH_ATTENDANCE_UPDATE = gql`
  mutation BatchAttendanceUpdate(
    $internId: uuid!, 
    $internSet: interns_set_input!, 
    $badgeObject: intern_badges_insert_input,
    $hasBadge: Boolean!,
    $attendanceObject: attendance_records_insert_input!
  ) {
    update_interns_by_pk(pk_columns: {id: $internId}, _set: $internSet) {
      id
      streak
      longest_streak
      total_points
    }
    insert_attendance_records_one(object: $attendanceObject) {
      id
    }
    insert_intern_badges_one(
      object: $badgeObject, 
      on_conflict: { 
        constraint: intern_badges_intern_id_badge_id_key, 
        update_columns: [earned_at] 
      }
    ) @include(if: $hasBadge) {
      id
    }
  }
`;

export const BATCH_TASK_COMPLETION = gql`
  mutation BatchTaskCompletion(
    $taskId: uuid!,
    $taskSet: tasks_set_input!,
    $internId: uuid!, 
    $internSet: interns_set_input!, 
    $badgeObject: intern_badges_insert_input,
    $hasBadge: Boolean!,
    $pointsObject: points_history_insert_input!
  ) {
    update_tasks_by_pk(pk_columns: {id: $taskId}, _set: $taskSet) {
      id
      status
    }
    update_interns_by_pk(pk_columns: {id: $internId}, _set: $internSet) {
      id
      total_points
      task_streak
    }
    insert_points_history_one(object: $pointsObject) {
      id
    }
    insert_intern_badges_one(
      object: $badgeObject, 
      on_conflict: { 
        constraint: intern_badges_intern_id_badge_id_key, 
        update_columns: [earned_at] 
      }
    ) @include(if: $hasBadge) {
      id
    }
  }
`;

export const INSERT_TASKS = gql`
  mutation InsertTasks($objects: [tasks_insert_input!]!) {
    insert_tasks(objects: $objects) {
      affected_rows
      returning {
        id
        intern_id
        parent_dept_task_id
        title
      }
    }
  }
`;

export const SET_RESET_OTP = gql`
  mutation SetResetOTP($email: String!, $otp: String!, $expires_at: timestamp!) {
    update_users(
      where: { email: { _eq: $email } },
      _set: { reset_otp: $otp, reset_otp_expires_at: $expires_at }
    ) {
      affected_rows
      returning {
        first_name
        last_name
      }
    }
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($email: String!, $password_hash: String!) {
    update_users(
      where: { email: { _eq: $email } },
      _set: { password_hash: $password_hash, reset_otp: null, reset_otp_expires_at: null }
    ) {
      affected_rows
    }
  }
`;

export const CLEAR_RESET_OTP = gql`
  mutation ClearResetOTP($email: String!) {
    update_users(
      where: { email: { _eq: $email } },
      _set: { reset_otp: null, reset_otp_expires_at: null }
    ) {
      affected_rows
    }
  }
`;

export const UPDATE_DEPARTMENT_TASK_STATUS = gql`
  mutation UpdateDepartmentTaskStatus($id: uuid!, $status: String!) {
    update_department_tasks_by_pk(pk_columns: { id: $id }, _set: { status: $status }) {
      id
      status
    }
  }
`;

export const INSERT_DEPARTMENT_TASK = gql`
  mutation InsertDepartmentTask($object: department_tasks_insert_input!) {
    insert_department_tasks_one(object: $object) {
      id
      title
    }
  }
`;

export const INSERT_DEPARTMENT_TASKS = gql`
  mutation InsertDepartmentTasks($objects: [department_tasks_insert_input!]!) {
    insert_department_tasks(objects: $objects) {
      affected_rows
      returning {
        id
        title
      }
    }
  }
`;

export const DELETE_DEPARTMENT_TASK = gql`
  mutation DeleteDepartmentTask($id: uuid!) {
    delete_department_tasks_by_pk(id: $id) {
      id
      title
    }
  }
`;

export const INSERT_MASTER_TASK = gql`
  mutation InsertMasterTask($object: master_tasks_insert_input!) {
    insert_master_tasks_one(object: $object) {
      id
      title
      department_tasks {
        id
        department_id
        status
      }
    }
  }
`;

export const DELETE_MASTER_TASK = gql`
  mutation DeleteMasterTask($id: uuid!) {
    delete_master_tasks_by_pk(id: $id) {
      id
      title
    }
  }
`;

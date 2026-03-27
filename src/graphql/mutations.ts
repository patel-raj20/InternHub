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

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
  query GetDepartments($organization_id: uuid!) {
    departments(where: { organization_id: { _eq: $organization_id } }) {
      id
      name
      description
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
      joining_date
      end_date
      created_at
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
      joining_date
      end_date
      created_at
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
      joining_date
      end_date
      created_at
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
      organization {
        id
        name
      }
      users_aggregate(where: { role: { _eq: "INTERN" } }) {
        aggregate {
          count
        }
      }
    }
  }
`;

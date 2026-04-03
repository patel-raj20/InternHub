import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { getSession } from "next-auth/react";
import { sanitizeData } from "@/lib/utils/security";

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_HASURA_GRAPHQL_ENDPOINT || "http://localhost:8080/v1/graphql",
});

const authLink = setContext(async (_, { headers }) => {
  // Get the session on the client side
  const session = await getSession();
  const token = session?.accessToken; // Adjust based on your session structure

  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      // For development/initial setup, if no token, you might want to use admin secret
      // but it's better to use proper auth flow.
      "x-hasura-admin-secret": "myadminsecretkey", // Temporary for dev setup
    },
  };
});

const securityLink = new ApolloLink((operation, forward) => {
  if (operation.variables) {
    operation.variables = sanitizeData(operation.variables);
  }
  return forward(operation);
});

export const client = new ApolloClient({
  link: ApolloLink.from([securityLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});

export default client;

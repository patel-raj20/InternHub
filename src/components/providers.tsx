"use client";

import { Provider } from "react-redux";
import { store } from "@/store";
import { ApolloProvider } from "@apollo/client/react/index.js";
import { client } from "@/graphql/client";
import { SessionProvider } from "next-auth/react";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Provider store={store}>
        <ApolloProvider client={client}>
          {children}
        </ApolloProvider>
      </Provider>
    </SessionProvider>
  );
}

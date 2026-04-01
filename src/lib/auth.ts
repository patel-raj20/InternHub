import { NextAuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { gqlFetch } from "./graphql-client";
import { UserRole } from "./types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      firstName?: string;
      lastName?: string;
      organization_id?: string;
      department_id?: string;
    } & DefaultSession["user"];
    accessToken?: string;
  }

  interface User {
    id: string;
    role: UserRole;
    firstName?: string;
    lastName?: string;
    organization_id?: string;
    department_id?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    firstName?: string;
    lastName?: string;
    organization_id?: string;
    department_id?: string;
  }
}

export const authOptions: NextAuthOptions = {
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                let data: any;
                try {
                    data = await gqlFetch(`
                        query GetUser($email: String!) {
                            users(where: {email: {_eq: $email}}) {
                                id
                                first_name
                                last_name
                                password_hash
                                email
                                organization_id
                                department_id
                                role
                            }
                        }
                    `, { email: credentials.email });
                } catch (error: any) {
                    console.error("❌ GQL Fetch failed (SignIn):", error.message);
                    return null;
                }

                const user = data?.users?.[0];
                if (!user) return null;

                // 🔐 Improved Password Check (bcrypt supported)
                let isValid = false;
                const isHashed = user.password_hash.startsWith("$2b$");

                if (isHashed) {
                    isValid = await bcrypt.compare(credentials.password, user.password_hash);
                } else {
                    // Fallback for legacy plain text passwords during transition
                    isValid = credentials.password === user.password_hash;
                }

                if (!isValid) return null;

                try {
                    await gqlFetch(`
                        mutation UpdateLastLogin($id: uuid!) {
                            update_users_by_pk(
                                pk_columns: {id: $id},
                                _set: {last_login_at: "now()"}
                            ) { id }
                        }
                    `, { id: user.id });
                } catch (error: any) {
                    console.error("❌ GQL failed Update last_login_at:", error.message);
                }

                return {
                    id: String(user.id),
                    firstName: user.first_name,
                    lastName: user.last_name,
                    email: user.email,
                    role: user.role,
                    organization_id: user.organization_id,
                    department_id: user.department_id,
                };
            },
        }),
    ],
    jwt: {
        async encode({ token, secret: nextAuthSecret }) {
            if (!token) return "";
            
            const key = new TextEncoder().encode((nextAuthSecret as string) || process.env.NEXTAUTH_SECRET);
            
            const claims: any = {
                "x-hasura-user-id": token.id,
                "x-hasura-roles": [token.role],
                "x-hasura-default-role": token.role,
                "x-hasura-allowed-roles": [token.role],
            };

            if (token.organization_id) {
                claims["x-hasura-org-id"] = token.organization_id;
            }

            return await new SignJWT({
                ...token,
                "https://hasura.io/jwt/claims": claims
            })
                .setProtectedHeader({ alg: "HS256" })
                .setIssuedAt()
                .setExpirationTime("30d")
                .sign(key);
        },
        async decode({ token, secret: nextAuthSecret }) {
            if (!token) return null;
            const key = new TextEncoder().encode((nextAuthSecret as string) || process.env.NEXTAUTH_SECRET);
            try {
                const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
                return payload as any;
            } catch (e: any) {
                console.error("JWT Decode failed:", e.message);
                return null;
            }
        },
    },
    callbacks: {
        async jwt({ token, user }: { token: any, user?: any }) {
            if (user) {
                token.id = user.id;
                token.firstName = user.firstName;
                token.lastName = user.lastName;
                token.email = user.email;
                token.role = user.role;
                token.organization_id = user.organization_id;
                token.department_id = user.department_id;
            }
            return token;
        },
        async session({ session, token }: { session: any, token: any }) {
            if (token) {
                session.user.id = token.id;
                session.user.firstName = token.firstName;
                session.user.lastName = token.lastName;
                session.user.email = token.email;
                session.user.role = token.role;
                session.user.organization_id = token.organization_id;
                session.user.department_id = token.department_id;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development',
};

export default authOptions;

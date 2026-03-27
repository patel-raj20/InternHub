import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { gqlFetch } from "./graphql-client";

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

export const authOptions = {
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
                email: {},
                password: {},
            },
            async authorize(credentials) {
                if (!credentials.email || !credentials.password) return null;

                let data;
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
                } catch (error) {
                    console.error("❌ GQL Fetch failed (SignIn):", error.message);
                    return null;
                }

                const user = data?.users?.[0];
                if (!user) return null;

                // TODO:  Replace with bcrypt.compare in production
                const isPasswordValid = credentials.password === user.password_hash; //
                if (!isPasswordValid) return null;

                try {
                    await gqlFetch(`
                        mutation UpdateLastLogin($id: uuid!) {
                            update_users_by_pk(
                                pk_columns: {id: $id},
                                _set: {last_login_at: "now()"}
                            ) { id }
                        }
                    `, { id: user.id });
                } catch (error) {
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
            
            // Re-encode secret just in case NextAuth passes a different one
            const key = new TextEncoder().encode(nextAuthSecret || process.env.NEXTAUTH_SECRET);
            
            return await new SignJWT({
                ...token,
                "https://hasura.io/jwt/claims": {
                    "x-hasura-user-id": token.id,
                    "x-hasura-roles": [token.role],
                    "x-hasura-default-role": token.role,
                    "x-hasura-allowed-roles": [token.role],
                }
            })
                .setProtectedHeader({ alg: "HS256" })
                .setIssuedAt()
                .setExpirationTime("30d") // Match session duration
                .sign(key);
        },
        async decode({ token, secret: nextAuthSecret }) {
            if (!token) return null;
            const key = new TextEncoder().encode(nextAuthSecret || process.env.NEXTAUTH_SECRET);
            try {
                const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
                return payload;
            } catch (e) {
                console.error("JWT Decode failed:", e.message);
                return null;
            }
        },
    },
    callbacks: {
        async jwt({ token, user }) {
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
        async session({ session, token }) {
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
};

export default authOptions;
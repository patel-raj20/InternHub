import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { gqlFetch } from "./graphql-client";

export const authOptions = {

    // Custom Sign-In Page
    pages: {
        signIn: "/login",
    },

    // Session Strategy: Use JWTs for stateless sessions
    session: {
        strategy: "jwt",
    },

    // Authentication Providers
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: {},
                password: {},
            },
            async authorize(credentials) {

                if (!credentials.email || !credentials.password) {
                    console.log("Missing email or password");
                    return null;
                }

                // Fetch User
                let data;

                try {
                    data = await gqlFetch(`
                        query GetUser($email: String!) 
                        {
                            users(where: {email: {_eq: $email}})
                            {
                                id
                                first_name
                                last_name
                                password_hash
                                role
                                email
                            }
                        }
                    `, { email: credentials.email }
                    );
                } catch (error) {
                    console.error("❌ GQL Fetch failed (SignIn):", error.message);
                    return null;    // IMPORTANT -> Prevents crashes and shows "Invalid email or password"
                }

                const user = data?.users?.[0];
                console.log("Fetched user:", user);     // TODO: DEBUGGING

                if (!user) {
                    console.log("No user found with that email");
                    return null;
                }

                // Password Check
                const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash);

                console.log("Password validation result:", isPasswordValid);    // TODO: DEBUGGING

                if (!isPasswordValid) {
                    console.log("Invalid password");
                    return null;
                }

                // Return user object (without password hash)
                return {
                    id: String(user.id),    // Ensure ID is a string for JWT encoding
                    firstName: user.first_name,
                    lastName: user.last_name,
                    email: user.email,
                    role: user.role,
                };
            },
        }),
    ],

    // Custom JWT Encoding/Decoding to include Hasura claims
    jwt: {
        async encode({ token, secret }) {
            if (!token) return "";

            return jwt.sign(
                {
                    ...token,
                    "https://hasura.io/jwt/claims":
                    {
                        "x-hasura-user-id": token.id,
                        "x-hasura-roles": token.role,
                        "x-hasura-default-role": token.role,
                        "x-hasura-allowed-roles": [token.role],
                    }
                },
                secret,
                { algorithm: "HS256" }
            );
        },

        async decode({ token, secret }) {
            if (!token) return null;
            return jwt.verify(token, secret);
        },
    },

    // JWT and Session Callbacks to include user info in the token and session
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.firstName = user.firstName;
                token.lastName = user.lastName;
                token.email = user.email;
                token.role = user.role;
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
            };
            return session;
        },
    },

    // Secret for JWT encoding (ensure this is set in your environment variables)
    secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;
import NextAuth from "next-auth";
import bcrypt from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "Enter your email" },
                password: { label: "Password", type: "password", placeholder: "Enter your password" },
            },
            async authorize(credentials) {
                const { email, password } = credentials;

                if (!email || !password) {
                    throw new Error("Email and password are required");
                }

                // Replace this with your actual user retrieval logic (e.g., database query)
                if (email === "admin@internhub.com" && password === "admin") {
                    return {
                        id: 1,
                        name: "Admin User",
                        email: "admin@internhub.com",
                        role: "SUPER_ADMIN",
                    }
                }
                return null; // Return null if authentication fails
            }
        }),
        
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.name = user.name;
                token.email = user.email;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.name = token.name;
                session.user.email = token.email;
                session.user.role = token.role;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
    //NEXTAUTH_SECRET=your_secret_key_here
});

export { handler as GET, handler as POST };
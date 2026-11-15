import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { base } from "./airtable";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const safeEmail = credentials.email.replace(/"/g, '\\"');
                const records = await base("Users")
                    .select({
                        filterByFormula: `{Email} = "${safeEmail}"`,
                        maxRecords: 1,
                    })
                    .firstPage();

                if (records.length === 0) return null;

                const user = records[0].fields as {
                    Email: string;
                    Name?: string;
                    PasswordHash?: string;
                };
                if (!user.PasswordHash) return null;

                const valid = await bcrypt.compare(
                    credentials.password,
                    user.PasswordHash
                );
                if (!valid) return null;

                return {
                    id: records[0].id,
                    email: user.Email,
                    name: user.Name ?? user.Email.split("@")[0],
                };
            },
        }),
    ],
    session: { strategy: "jwt" },
    pages: { signIn: "/login" },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt({ token, user }) {
            if (user) token.id = user.id;
            return token;
        },
        async session({ session, token }) {
            if (session.user) (session.user as any).id = token.id;
            return session;
        },
    },
};
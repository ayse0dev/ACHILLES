import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { base } from "./airtable";
import { verifyOTP } from "@/lib/otp";

export const authOptions: NextAuthOptions = {
    providers: [
        ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
            ? [
                  GoogleProvider({
                      clientId: process.env.GOOGLE_CLIENT_ID,
                      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                  }),
              ]
            : []),
        ...(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET
            ? [
                  FacebookProvider({
                      clientId: process.env.FACEBOOK_CLIENT_ID,
                      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
                  }),
              ]
            : []),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                otp: { label: "OTP", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.email) return null;

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

                // If OTP is provided, verify OTP
                if (credentials.otp) {
                    const validOtp = verifyOTP(credentials.email, credentials.otp);
                    if (!validOtp) return null;
                    return {
                        id: records[0].id,
                        email: user.Email,
                        name: user.Name ?? user.Email.split("@")[0],
                    };
                }

                // Password check fallback
                if (!credentials.password || !user.PasswordHash) return null;

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

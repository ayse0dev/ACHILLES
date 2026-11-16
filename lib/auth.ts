import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { findUserByEmail } from "./users";
import { normalizeRole } from "./roles";
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

                const record = await findUserByEmail(credentials.email);
                if (!record) return null;

                const user = record.fields as {
                    Email: string;
                    Name?: string;
                    PasswordHash?: string;
                    Role?: string;
                };
                const sessionUser = {
                    id: record.id,
                    email: user.Email,
                    name: user.Name ?? user.Email.split("@")[0],
                    role: normalizeRole(user.Role),
                };

                if (!credentials.password || !credentials.otp || !user.PasswordHash) return null;

                const validOtp = await verifyOTP(credentials.email, credentials.otp);
                if (!validOtp) return null;

                const valid = await bcrypt.compare(credentials.password, user.PasswordHash);
                return valid ? sessionUser : null;
            },
        }),
    ],
    session: { strategy: "jwt" },
    pages: { signIn: "/login" },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as { role?: string }).role ?? "customer";
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                const u = session.user as { id?: unknown; role?: unknown };
                u.id = token.id;
                u.role = token.role;
            }
            return session;
        },
    },
};

import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { findUserByIdentifier } from "./users";
import { normalizeRole } from "./roles";
import { verifyOTP } from "@/lib/otp";
import { blockedMinutes, clearFailures, recordFailure } from "@/lib/rateLimit";
import { audit } from "@/lib/audit";

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
                const failKey = `acct:${credentials.email.trim().toLowerCase()}`;
                if (blockedMinutes(failKey, 5, 900000) > 0) return null;

                const record = await findUserByIdentifier(credentials.email);
                if (!record) return null;

                const user = record.fields as {
                    Email: string;
                    Name?: string;
                    PasswordHash?: string;
                    Role?: string;
                    VerifyToken?: string;
                };
                const sessionUser = {
                    id: record.id,
                    email: user.Email,
                    name: user.Name ?? user.Email.split("@")[0],
                    role: normalizeRole(user.Role),
                };

                if (!credentials.password || !credentials.otp || !user.PasswordHash) return null;
                if (user.VerifyToken) return null;

                const validOtp = await verifyOTP(user.Email, credentials.otp);
                if (!validOtp) {
                    recordFailure(failKey);
                    await audit(user.Email, "login_failed", "otp");
                    return null;
                }

                const valid = await bcrypt.compare(credentials.password, user.PasswordHash);
                if (!valid) recordFailure(failKey);
                if (valid) {
                    clearFailures(failKey);
                    await audit(sessionUser.email, "login_success", sessionUser.role);
                }
                return valid ? sessionUser : null;
            },
        }),
    ],
    session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
    jwt: { maxAge: 8 * 60 * 60 },
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

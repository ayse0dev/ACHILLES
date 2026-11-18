"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { z } from "zod";
import { findUserByIdentifier } from "@/lib/users";
import { generateOTP, sendOtpEmail } from "@/lib/otp";
import { blockedMinutes, clearFailures, ipFrom, recordFailure } from "@/lib/rateLimit";
import { audit } from "@/lib/audit";
import { resendVerification } from "@/lib/verify";

const schema = z.object({
    identifier: z.string().trim().min(2).max(120),
    password: z.string().min(1),
});

export type RequestCodeState = { error?: string; codeSent?: boolean; sentTo?: string };

const MAX_PER_ACCOUNT = 5;
const MAX_PER_IP = 20;
const WINDOW_MS = 15 * 60 * 1000;

function maskEmail(email: string) {
    const [user, domain] = email.split("@");
    return `${user.slice(0, 2)}${"*".repeat(Math.max(1, user.length - 2))}@${domain}`;
}

export async function requestLoginCode(
    _prev: RequestCodeState,
    formData: FormData
): Promise<RequestCodeState> {
    const parsed = schema.safeParse({
        identifier: formData.get("identifier"),
        password: formData.get("password"),
    });
    if (!parsed.success) {
        return { error: "Enter your email or username and your password." };
    }

    const ip = ipFrom(await headers());
    const accountKey = `acct:${parsed.data.identifier.toLowerCase()}`;
    const ipKey = `ip:${ip}`;

    const wait = Math.max(blockedMinutes(accountKey, MAX_PER_ACCOUNT, WINDOW_MS), blockedMinutes(ipKey, MAX_PER_IP, WINDOW_MS));
    if (wait > 0) {
        return { error: `Too many wrong attempts. Please try again in ${wait} minute${wait === 1 ? "" : "s"}.` };
    }

    const fail = async () => {
        recordFailure(accountKey);
        recordFailure(ipKey);
        await audit(parsed.data.identifier, "login_failed", "password");
        return { error: "Invalid email, username or password." };
    };

    const record = await findUserByIdentifier(parsed.data.identifier);
    const profile = record?.fields as { Email?: string; Name?: string; PasswordHash?: string; VerifyToken?: string } | undefined;
    if (!record || !profile?.PasswordHash || !profile.Email) return fail();

    if (!(await bcrypt.compare(parsed.data.password, profile.PasswordHash))) return fail();

    clearFailures(accountKey);

    if (profile.VerifyToken) {
        try {
            await resendVerification(record.id, profile.Email, profile.Name ?? "there");
        } catch {
            return { error: "Please verify your email first. We could not send a new link, try again shortly." };
        }
        return { error: "Please verify your email first. We just sent you a new verification link." };
    }

    const code = await generateOTP(profile.Email);
    if (!code) return fail();

    try {
        await sendOtpEmail(profile.Email, code);
    } catch (err) {
        console.error("[login] could not send the code email:", err instanceof Error ? `${err.name}: ${err.message}` : String(err));
        return { error: "We couldn't send the code email. Please try again." };
    }

    return { codeSent: true, sentTo: maskEmail(profile.Email) };
}

"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { base } from "@/lib/airtable";
import { roleLabel } from "@/lib/roles";
import { findUserByEmail, findUserByUsername, normalizeUsername } from "@/lib/users";
import { newVerification, resendVerification, sendVerificationEmail, VERIFY_TTL_SECONDS } from "@/lib/verify";
import { allow, TOO_MANY } from "@/lib/rateLimit";

const schema = z.object({
    name: z.string().min(2),
    username: z
        .string()
        .trim()
        .toLowerCase()
        .regex(/^[a-z0-9_.]{3,20}$/, "Username must be 3 to 20 characters: letters, numbers, dot or underscore."),
    email: z.string().email(),
    password: z.string().min(8),
});

export type RegisterState = { error?: string; success?: boolean; email?: string; expiresIn?: number };

export async function registerUser(
    _prev: RegisterState,
    formData: FormData
): Promise<RegisterState> {
    if (formData.get("website")) return { success: true } as never;
    if (!formData.get("consent")) return { error: "Please agree to the Privacy Policy to continue." };
    const parsed = schema.safeParse({
        name: formData.get("name"),
        username: formData.get("username"),
        email: formData.get("email"),
        password: formData.get("password"),
    });

    if (!parsed.success) {
        return { error: "Please check your details (password min 8 chars)." };
    }

    const { name, email, password } = parsed.data;
    const username = normalizeUsername(parsed.data.username);

    if (await findUserByUsername(username)) {
        return { error: "That username is taken. Please choose another." };
    }

    if (await findUserByEmail(email)) {
        return { error: "An account with this email already exists." };
    }

    const hash = await bcrypt.hash(password, 12);
    const verification = newVerification();

    try {
        await base("Users").create({
        Email: email,
        Name: name,
        Username: username,
        PasswordHash: hash,
        Role: roleLabel("customer"),
        VerifyToken: verification.hash,
        VerifyExpires: verification.expires,
        });
    } catch (err) {
        console.error("register: Airtable create failed:", err instanceof Error ? err.message : err);
        const reason = err instanceof Error ? err.message : "unknown error";
        const generic = "We could not create your account right now. Please try again, or contact support if it keeps happening.";
        return { error: process.env.NODE_ENV === "production" ? generic : `${generic} (Dev detail: ${reason})` };
    }

    try {
        await sendVerificationEmail(email, name, verification.token);
    } catch {
        return { error: "Your account was created but we could not send the verification email. Try logging in to get a new link." };
    }

    return { success: true, email, expiresIn: VERIFY_TTL_SECONDS };
}

export type ResendState = { sent?: number; error?: string };

export async function resendVerificationLink(prev: ResendState, formData: FormData): Promise<ResendState> {
    const email = String(formData.get("email") ?? "").trim();
    if (!email) return { error: "Missing email." };
    if (!(await allow("resend", 5, 900, email.toLowerCase()))) return { error: TOO_MANY };

    const record = await findUserByEmail(email);
    const fields = record?.fields as { VerifyToken?: string; Name?: string } | undefined;
    if (record && fields?.VerifyToken) {
        try {
            await resendVerification(record.id, email, fields.Name ?? "there");
        } catch {
            return { error: "We could not send the email. Please try again." };
        }
    }
    return { sent: (prev.sent ?? 0) + 1 };
}

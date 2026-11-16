"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { findUserByEmail } from "@/lib/users";
import { generateOTP, sendOtpEmail } from "@/lib/otp";
import { allow, hit, TOO_MANY } from "@/lib/rateLimit";
import { audit } from "@/lib/audit";

const schema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export type RequestCodeState = { error?: string; codeSent?: boolean };

export async function requestLoginCode(
    _prev: RequestCodeState,
    formData: FormData
): Promise<RequestCodeState> {
    const parsed = schema.safeParse({
        email: formData.get("email"),
        password: formData.get("password"),
    });
    if (!parsed.success) {
        return { error: "Enter a valid email and password." };
    }

    if (!(await allow("login", 15, 900))) return { error: TOO_MANY };
    if (!hit(`login-email:${parsed.data.email.toLowerCase()}`, 6, 900000)) return { error: TOO_MANY };

    const record = await findUserByEmail(parsed.data.email);
    const hash = (record?.fields as { PasswordHash?: string } | undefined)?.PasswordHash;
    if (!record || !hash) {
        return { error: "Invalid email or password." };
    }

    const passwordOk = await bcrypt.compare(parsed.data.password, hash);
    if (!passwordOk) {
        await audit(parsed.data.email, "login_failed", "password");
        return { error: "Invalid email or password." };
    }

    const code = await generateOTP(parsed.data.email);
    if (!code) {
        return { error: "Invalid email or password." };
    }

    try {
        await sendOtpEmail(parsed.data.email, code);
    } catch {
        return { error: "We couldn't send the code email. Please try again." };
    }

    return { codeSent: true };
}

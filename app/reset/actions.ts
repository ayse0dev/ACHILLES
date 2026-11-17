"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { base } from "@/lib/airtable";
import { audit } from "@/lib/audit";
import { allow, TOO_MANY } from "@/lib/rateLimit";
import { consumeResetToken } from "@/lib/reset";

export type ResetState = { error?: string; done?: boolean };

export async function resetPassword(_prev: ResetState, formData: FormData): Promise<ResetState> {
    const parsed = z
        .object({ email: z.string().min(2), token: z.string().min(20), password: z.string().min(8).max(100), confirm: z.string() })
        .safeParse({
            email: formData.get("email"),
            token: formData.get("token"),
            password: formData.get("password"),
            confirm: formData.get("confirm"),
        });
    if (!parsed.success) return { error: "The new password needs at least 8 characters." };
    if (parsed.data.password !== parsed.data.confirm) return { error: "The two passwords do not match." };

    if (!(await allow("reset", 10, 900))) return { error: TOO_MANY };

    const id = await consumeResetToken(parsed.data.email, parsed.data.token);
    if (!id) return { error: "This reset link is invalid or has expired. Request a new one." };

    await base("Users").update(id, {
        PasswordHash: await bcrypt.hash(parsed.data.password, 12),
        ResetToken: "",
        ResetExpires: 0,
        VerifyToken: "",
        VerifyExpires: 0,
        OtpCode: "",
        OtpExpiresAt: 0,
    });
    await audit(parsed.data.email, "password_reset", id);

    return { done: true };
}

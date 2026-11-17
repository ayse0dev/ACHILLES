"use server";

import { z } from "zod";
import { allow, TOO_MANY } from "@/lib/rateLimit";
import { sendResetLink } from "@/lib/reset";

export type ForgotState = { error?: string; sent?: boolean };

export async function requestPasswordReset(_prev: ForgotState, formData: FormData): Promise<ForgotState> {
    const parsed = z.object({ identifier: z.string().trim().min(2).max(120) }).safeParse({ identifier: formData.get("identifier") });
    if (!parsed.success) return { error: "Enter your email or username." };

    if (!(await allow("forgot", 5, 900, parsed.data.identifier.toLowerCase()))) return { error: TOO_MANY };

    try {
        await sendResetLink(parsed.data.identifier);
    } catch {
        return { error: "We could not send the email right now. Please try again." };
    }
    return { sent: true };
}

"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { base } from "@/lib/airtable";
import { getCurrentUser } from "@/lib/session";

export type AccountState = { error?: string; success?: boolean };

export async function updateProfile(_prev: AccountState, formData: FormData): Promise<AccountState> {
    const user = await getCurrentUser();
    if (!user) return { error: "Log in first." };

    const parsed = z.object({ name: z.string().trim().min(2).max(80) }).safeParse({ name: formData.get("name") });
    if (!parsed.success) return { error: "Enter a name with at least 2 characters." };

    await base("Users").update(user.id, { Name: parsed.data.name });
    return { success: true };
}

export async function changePassword(_prev: AccountState, formData: FormData): Promise<AccountState> {
    const user = await getCurrentUser();
    if (!user) return { error: "Log in first." };

    const parsed = z
        .object({ current: z.string().min(1), next: z.string().min(8).max(100) })
        .safeParse({ current: formData.get("current"), next: formData.get("next") });
    if (!parsed.success) return { error: "The new password needs at least 8 characters." };

    const record = await base("Users").find(user.id);
    const hash = (record.fields as { PasswordHash?: string }).PasswordHash;
    if (!hash || !(await bcrypt.compare(parsed.data.current, hash))) {
        return { error: "Your current password is incorrect." };
    }

    await base("Users").update(user.id, { PasswordHash: await bcrypt.hash(parsed.data.next, 12) });
    return { success: true };
}

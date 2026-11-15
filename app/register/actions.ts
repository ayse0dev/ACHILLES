"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { base } from "@/lib/airtable";

const schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
});

export type RegisterState = { error?: string; success?: boolean };

export async function registerUser(
    _prev: RegisterState,
    formData: FormData
): Promise<RegisterState> {
    const parsed = schema.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
    });

    if (!parsed.success) {
        return { error: "Please check your details (password min 8 chars)." };
    }

    const { name, email, password } = parsed.data;
    const safeEmail = email.replace(/"/g, '\\"');

    const existing = await base("Users")
        .select({
            filterByFormula: `{Email} = "${safeEmail}"`,
            maxRecords: 1,
        })
        .firstPage();

    if (existing.length > 0) {
        return { error: "An account with this email already exists." };
    }

    const hash = await bcrypt.hash(password, 12);

    await base("Users").create({
        Email: email,
        Name: name,
        PasswordHash: hash,
    });

    return { success: true };
}
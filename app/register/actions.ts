"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { base } from "@/lib/airtable";
import { findUserByEmail } from "@/lib/users";
import { allow, TOO_MANY } from "@/lib/rateLimit";

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
    if (formData.get("website")) return { success: true } as never;
    if (!(await allow("register", 5, 3600))) return { error: TOO_MANY };
    if (!formData.get("consent")) return { error: "Please agree to the Privacy Policy to continue." };
    const parsed = schema.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
    });

    if (!parsed.success) {
        return { error: "Please check your details (password min 8 chars)." };
    }

    const { name, email, password } = parsed.data;

    if (await findUserByEmail(email)) {
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

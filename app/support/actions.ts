"use server";

import { z } from "zod";
import { base } from "@/lib/airtable";
import { sendEmail } from "@/lib/mail";
import { notify } from "@/lib/notify";
import { allow, TOO_MANY } from "@/lib/rateLimit";
import { newReference } from "@/lib/reference";

const schema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    subject: z.string().min(3).max(120),
    message: z.string().min(5).max(2000),
});

export type SupportState = { error?: string; reference?: string };

export async function openTicket(_prev: SupportState, formData: FormData): Promise<SupportState> {
    if (formData.get("website")) return { success: true } as never;
    if (!(await allow("support", 5, 3600))) return { error: TOO_MANY };
    const parsed = schema.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
        subject: formData.get("subject"),
        message: formData.get("message"),
    });
    if (!parsed.success) return { error: "Please fill in every field with a valid email." };

    const d = parsed.data;
    const reference = newReference("TK");

    await base("Tickets").create({
        Reference: reference,
        Name: d.name,
        Email: d.email,
        Subject: d.subject,
        Message: d.message,
        Status: "Open",
        CreatedAt: new Date().toISOString(),
    });

    await sendEmail(
        d.email,
        `We received your ticket ${reference}`,
        `Hi ${d.name},\n\nYour ticket "${d.subject}" is open. Your reference number is ${reference}. Use it on the Track page to follow progress.`
    );

    await notify(d.email, "Ticket opened", `Reference ${reference}.`, "/track");

    return { reference };
}

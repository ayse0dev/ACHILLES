"use server";

import { z } from "zod";
import { base } from "@/lib/airtable";
import { sendEmail } from "@/lib/mail";

const schema = z.object({
    name: z.string().min(1),
    phone: z.string().optional(),
    email: z.string().email(),
    service: z.enum(["Repair", "Purchase", "Inquiry"]),
    item: z.string().optional(),
    photoUrl: z.string().url().optional().or(z.literal("")),
    message: z.string().min(5).max(2000),
});

export type ContactState = { error?: string; success?: boolean };

export async function sendContactMessage(_prev: ContactState, formData: FormData): Promise<ContactState> {
    const parsed = schema.safeParse({
        name: formData.get("name"),
        phone: formData.get("phone") || undefined,
        email: formData.get("email"),
        service: formData.get("service"),
        item: formData.get("item") || undefined,
        photoUrl: formData.get("photoUrl") ?? "",
        message: formData.get("message"),
    });
    if (!parsed.success) {
        return { error: "Please fill in your name, a valid email and a message." };
    }

    const d = parsed.data;
    await base("Inquiries").create({
        Name: d.name,
        Phone: d.phone ?? "",
        Email: d.email,
        Service: d.service,
        Item: d.item ?? "",
        PhotoUrl: d.photoUrl || undefined,
        Message: d.message,
        CreatedAt: new Date().toISOString(),
    });

    const inbox = process.env.CONTACT_EMAIL ?? process.env.MAIL_FROM ?? "";
    await sendEmail(
        inbox,
        `New ${d.service.toLowerCase()} message from ${d.name}`,
        `Name: ${d.name}\nEmail: ${d.email}\nPhone: ${d.phone ?? "-"}\nService: ${d.service}\nItem: ${d.item ?? "-"}\nPhoto: ${d.photoUrl || "-"}\n\n${d.message}`
    );

    return { success: true };
}

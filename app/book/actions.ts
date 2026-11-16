"use server";

import { base } from "@/lib/airtable";
import { sendEmail } from "@/lib/mail";
import { z } from "zod";

const schema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    service: z.enum(["Drop-off", "Pickup", "Consultation"]),
    shoeDescription: z.string().min(5),
    preferredDate: z.string().optional(),
    notes: z.string().optional(),
});

export type BookState = { error?: string; success?: boolean };

export async function bookAppointment(_prev: BookState, formData: FormData): Promise<BookState> {
    const parsed = schema.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone") ?? undefined,
        service: formData.get("service"),
        shoeDescription: formData.get("shoeDescription"),
        preferredDate: formData.get("preferredDate") ?? undefined,
        notes: formData.get("notes") ?? undefined,
    });

    if (!parsed.success) {
        return { error: "Please check the form. Shoe details need at least 5 characters." };
    }

    const d = parsed.data;
    await base("Appointments").create({
        Name: d.name,
        Email: d.email,
        Phone: d.phone ?? "",
        Service: d.service,
        ShoeDescription: d.shoeDescription,
        PreferredDate: d.preferredDate || undefined,
        Notes: d.notes ?? "",
        Status: "Requested",
        CreatedAt: new Date().toISOString(),
    });

    await sendEmail(
        d.email,
        "We received your ACHILLES booking request",
        `Hi ${d.name},\n\nThanks for booking a ${d.service.toLowerCase()} with ACHILLES. We'll confirm your time by email.\n\nShoe: ${d.shoeDescription}`
    );

    return { success: true };
}

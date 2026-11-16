"use server";

import { base } from "@/lib/airtable";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendEmail } from "@/lib/mail";
import { z } from "zod";

const schema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    shoeDescription: z.string().min(5),
    issue: z.string().min(5),
    photoUrl: z.string().url().optional().or(z.literal("")),
});

export type RepairState = { error?: string; success?: boolean };

export async function submitRepair(
    _prev: RepairState,
    formData: FormData
): Promise<RepairState> {
    const parsed = schema.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone") ?? undefined,
        shoeDescription: formData.get("shoeDescription"),
        issue: formData.get("issue"),
        photoUrl: formData.get("photoUrl") ?? "",
    });

    if (!parsed.success) {
        return { error: "Please fill all required fields correctly." };
    }

    const session = await getServerSession(authOptions);
    const d = parsed.data;

    await base("RepairRequests").create({
        Name: d.name,
        Email: d.email,
        Phone: d.phone ?? "",
        ShoeDescription: d.shoeDescription,
        Issue: d.issue,
        PhotoUrl: d.photoUrl || undefined,
        Status: "Pending",
        SubmittedAt: new Date().toISOString(),
        UserId: (session?.user as { id?: string } | undefined)?.id ?? "",
    });

    await sendEmail(
        d.email,
        "We received your ACHILLES repair request",
        `Hi ${d.name},\n\nThanks for sending us your ${d.shoeDescription}. We'll email you a quote within 24 hours.\n\nYou can check progress any time on the Track page.`
    );

    return { success: true };
}

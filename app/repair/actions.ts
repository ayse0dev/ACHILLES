"use server";

import { base } from "@/lib/airtable";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendEmail } from "@/lib/mail";
import { notify } from "@/lib/notify";
import { allow, TOO_MANY } from "@/lib/rateLimit";
import { z } from "zod";
import { newReference } from "@/lib/reference";

const schema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    shoeDescription: z.string().min(5),
    issue: z.string().min(5),
    photoUrl: z.string().url().optional().or(z.literal("")),
});

export type RepairState = { error?: string; success?: boolean; reference?: string };

export async function submitRepair(
    _prev: RepairState,
    formData: FormData
): Promise<RepairState> {
    if (formData.get("website")) return { success: true } as never;
    if (!(await allow("repair", 5, 3600))) return { error: TOO_MANY };
    if (!formData.get("consent")) return { error: "Please agree to the Privacy Policy to continue." };
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

    const reference = newReference("RP");

    await base("RepairRequests").create({
        Reference: reference,
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
        `Hi ${d.name},\n\nThanks for sending us your ${d.shoeDescription}. We'll email you a quote within 24 hours.\n\nYour reference number is ${reference}. Use it on the Track page to follow progress.`
    );

    await notify(d.email, "Repair request received", `Reference ${reference}. We will send a quote within 24 hours.`, "/track");

    return { success: true, reference };
}

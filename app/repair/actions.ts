"use server";

import { base } from "@/lib/airtable";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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

    await base("RepairRequests").create({
        Name: parsed.data.name,
        Email: parsed.data.email,
        Phone: parsed.data.phone ?? "",
        ShoeDescription: parsed.data.shoeDescription,
        Issue: parsed.data.issue,
        PhotoUrl: parsed.data.photoUrl || undefined,
        Status: "Pending",
        SubmittedAt: new Date().toISOString(),
        UserId: (session?.user as any)?.id ?? "",
    });

    return { success: true };
}
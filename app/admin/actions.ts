"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { base } from "@/lib/airtable";
import { sendEmail } from "@/lib/mail";
import { isStaff } from "@/lib/roles";
import { getCurrentUser } from "@/lib/session";

const STATUSES = ["Pending", "In progress", "Ready", "Completed"] as const;

const schema = z.object({
    id: z.string().min(1),
    status: z.enum(STATUSES),
    quote: z.string().optional(),
});

export type AdminState = { error?: string; success?: boolean };

export async function updateRepair(_prev: AdminState, formData: FormData): Promise<AdminState> {
    const user = await getCurrentUser();
    if (!user || !isStaff(user.role)) return { error: "Not authorized." };

    const parsed = schema.safeParse({
        id: formData.get("id"),
        status: formData.get("status"),
        quote: formData.get("quote") || undefined,
    });
    if (!parsed.success) return { error: "Invalid status." };

    const quoteNumber = parsed.data.quote ? Number(parsed.data.quote) : undefined;
    if (quoteNumber !== undefined && (Number.isNaN(quoteNumber) || quoteNumber < 0)) {
        return { error: "Quote must be a positive number." };
    }

    const before = await base("RepairRequests").find(parsed.data.id);
    const fields = before.fields as { Name?: string; Email?: string; Status?: string; Quote?: number; ShoeDescription?: string };

    const statusChanged = fields.Status !== parsed.data.status;
    const quoteChanged = quoteNumber !== undefined && quoteNumber !== fields.Quote;

    await base("RepairRequests").update(parsed.data.id, {
        Status: parsed.data.status,
        ...(quoteNumber !== undefined ? { Quote: quoteNumber } : {}),
    });

    if (fields.Email && (statusChanged || quoteChanged)) {
        const lines = [`Hi ${fields.Name ?? "there"},`, "", `Your repair for ${fields.ShoeDescription ?? "your shoe"} is now: ${parsed.data.status}.`];
        if (quoteNumber !== undefined) lines.push(`Quote: $${quoteNumber.toFixed(2)}`);
        lines.push("", "Check the Track page any time for updates.");
        await sendEmail(fields.Email, "Your ACHILLES repair update", lines.join("\n"));
    }

    revalidatePath("/admin");
    return { success: true };
}

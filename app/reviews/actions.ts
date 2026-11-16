"use server";

import { base } from "@/lib/airtable";
import { formulaString } from "@/lib/formula";
import { getCurrentUser } from "@/lib/session";
import { z } from "zod";
import { allow, TOO_MANY } from "@/lib/rateLimit";

const schema = z.object({
    rating: z.coerce.number().int().min(1).max(5),
    comment: z.string().min(10).max(1000),
    photoUrl: z.string().url().optional().or(z.literal("")),
    reference: z
        .string()
        .regex(/^(RP|OR)-[A-Z0-9]{6}$/)
        .optional()
        .or(z.literal("")),
});

export type ReviewState = { error?: string; success?: boolean };

const finished = ["Completed", "Delivered"];

export async function submitReview(_prev: ReviewState, formData: FormData): Promise<ReviewState> {
    const user = await getCurrentUser();
    if (!user) return { error: "Log in to leave a review." };
    if (!(await allow("review", 5, 3600, user.email))) return { error: TOO_MANY };

    const parsed = schema.safeParse({
        rating: formData.get("rating"),
        comment: formData.get("comment"),
        photoUrl: formData.get("photoUrl") ?? "",
        reference: formData.get("reference") ?? "",
    });
    if (!parsed.success) {
        return { error: "Choose a rating and write at least 10 characters." };
    }

    const reference = parsed.data.reference || "";

    if (reference) {
        const table = reference.startsWith("RP-") ? "RepairRequests" : "Orders";
        const found = await base(table)
            .select({ filterByFormula: `{Reference} = ${formulaString(reference)}`, maxRecords: 1 })
            .firstPage();
        const f = found[0]?.fields as { Email?: string; Status?: string } | undefined;
        if (!f || f.Email?.toLowerCase() !== user.email.toLowerCase()) {
            return { error: "That reference does not belong to your account." };
        }
        if (!finished.includes(String(f.Status))) {
            return { error: "You can review once the transaction is completed." };
        }
        const existing = await base("Reviews")
            .select({ filterByFormula: `{Reference} = ${formulaString(reference)}`, maxRecords: 1 })
            .firstPage();
        if (existing.length > 0) return { error: "You already reviewed this transaction." };
    }

    await base("Reviews").create({
        Name: user.name ?? user.email.split("@")[0],
        Email: user.email,
        Rating: parsed.data.rating,
        Comment: parsed.data.comment,
        PhotoUrl: parsed.data.photoUrl || undefined,
        Reference: reference,
        Approved: false,
        CreatedAt: new Date().toISOString(),
    });

    return { success: true };
}

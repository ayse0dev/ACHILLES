"use server";

import { base } from "@/lib/airtable";
import { z } from "zod";

const schema = z.object({
    email: z
        .string()
        .email()
        .refine((v) => !v.includes('"'), "Invalid email"),
});

export type TrackResult = {
    shoe: string;
    status: string;
    submitted: string;
};

export type TrackState = { error?: string; searched?: boolean; results?: TrackResult[] };

export async function lookupRepairs(_prev: TrackState, formData: FormData): Promise<TrackState> {
    const parsed = schema.safeParse({ email: formData.get("email") });
    if (!parsed.success) {
        return { error: "Please enter a valid email address." };
    }

    try {
        const records = await base("RepairRequests")
            .select({
                filterByFormula: `LOWER({Email}) = LOWER("${parsed.data.email}")`,
                sort: [{ field: "SubmittedAt", direction: "desc" }],
                maxRecords: 5,
                fields: ["ShoeDescription", "Status", "SubmittedAt"],
            })
            .firstPage();

        return {
            searched: true,
            results: records.map((r) => ({
                shoe: String(r.get("ShoeDescription") ?? "Your shoe"),
                status: String(r.get("Status") ?? "Pending"),
                submitted: r.get("SubmittedAt")
                    ? new Date(String(r.get("SubmittedAt"))).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                      })
                    : "",
            })),
        };
    } catch {
        return { error: "We couldn't look up repairs right now. Please try again later." };
    }
}

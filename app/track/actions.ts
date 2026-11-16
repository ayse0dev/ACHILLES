"use server";

import { base } from "@/lib/airtable";
import { formulaString } from "@/lib/formula";
import { orderSteps, repairSteps, ticketSteps } from "@/lib/reference";
import { z } from "zod";
import { allow, TOO_MANY } from "@/lib/rateLimit";

const schema = z.object({
    reference: z
        .string()
        .trim()
        .toUpperCase()
        .regex(/^(RP|OR|TK)-[A-Z0-9]{6}$/, "Enter a reference like RP-4K7M2X, OR-9Q3T5V or TK-3H8W2D."),
});

export type TrackResult = {
    kind: "Repair" | "Order" | "Ticket";
    reference: string;
    title: string;
    status: string;
    steps: string[];
    submitted: string;
    note?: string;
};

export type TrackState = { error?: string; searched?: boolean; result?: TrackResult };

function formatDate(value: unknown) {
    if (!value) return "";
    return new Date(String(value)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export async function lookupReference(_prev: TrackState, formData: FormData): Promise<TrackState> {
    if (!(await allow("track", 30, 600))) return { error: TOO_MANY };
    const parsed = schema.safeParse({ reference: formData.get("reference") });
    if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message ?? "Invalid reference." };
    }

    const reference = parsed.data.reference;
    const isRepair = reference.startsWith("RP-");
    const isTicket = reference.startsWith("TK-");

    try {
        const records = await base(isRepair ? "RepairRequests" : isTicket ? "Tickets" : "Orders")
            .select({
                filterByFormula: `{Reference} = ${formulaString(reference)}`,
                maxRecords: 1,
            })
            .firstPage();

        const r = records[0];
        if (!r) return { searched: true };

        if (isTicket) {
            return {
                searched: true,
                result: {
                    kind: "Ticket",
                    reference,
                    title: String(r.get("Subject") ?? "Your ticket"),
                    status: String(r.get("Status") ?? "Open"),
                    steps: ticketSteps,
                    submitted: formatDate(r.get("CreatedAt")),
                    note: r.get("Reply") ? `Reply: ${String(r.get("Reply"))}` : undefined,
                },
            };
        }

        if (isRepair) {
            return {
                searched: true,
                result: {
                    kind: "Repair",
                    reference,
                    title: String(r.get("ShoeDescription") ?? "Your shoe"),
                    status: String(r.get("Status") ?? "Pending"),
                    steps: repairSteps,
                    submitted: formatDate(r.get("SubmittedAt")),
                    note: r.get("Quote") ? `Quote: ₱${Number(r.get("Quote")).toFixed(2)}` : undefined,
                },
            };
        }

        return {
            searched: true,
            result: {
                kind: "Order",
                reference,
                title: String(r.get("Items") ?? "Your order"),
                status: String(r.get("Status") ?? "Paid"),
                steps: orderSteps,
                submitted: formatDate(r.get("CreatedAt")),
                note: r.get("Tracking") ? `Tracking: ${String(r.get("Tracking"))}` : undefined,
            },
        };
    } catch {
        return { error: "We couldn't look that up right now. Please try again later." };
    }
}

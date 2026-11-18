import { NextResponse } from "next/server";
import { z } from "zod";
import { base } from "@/lib/airtable";
import { formulaString } from "@/lib/formula";
import { getCurrentUser } from "@/lib/session";
import { createInvoice } from "@/lib/xendit";
import { repairPaid, repairServices } from "@/lib/receipt";
import { hit, ipFrom } from "@/lib/rateLimit";

const schema = z.object({ reference: z.string().regex(/^RP-[A-Z0-9]{6}$/) });

export async function POST(request: Request) {
    try {
        if (!hit(`repairpay:${ipFrom(request.headers)}`, 10, 60000)) {
            return NextResponse.json({ error: "Too many requests." }, { status: 429 });
        }
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Log in to pay." }, { status: 401 });

        const parsed = schema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return NextResponse.json({ error: "Invalid repair reference." }, { status: 400 });
        const reference = parsed.data.reference;

        const found = await base("RepairRequests")
            .select({ filterByFormula: `{Reference} = ${formulaString(reference)}`, maxRecords: 1 })
            .firstPage();
        const repair = found[0];
        if (!repair) return NextResponse.json({ error: "Repair not found." }, { status: 404 });

        const f = repair.fields as { Email?: string; UserId?: string; Quote?: number; Issue?: string; ShoeDescription?: string };
        const owner = (f.Email ?? "").toLowerCase() === user.email.toLowerCase() || f.UserId === user.id;
        if (!owner) return NextResponse.json({ error: "Repair not found." }, { status: 404 });

        const quote = Number(f.Quote ?? 0);
        if (quote <= 0) return NextResponse.json({ error: "Your quote is not ready yet. We will notify you once it is." }, { status: 400 });
        if (repairPaid(f.Issue ?? "")) return NextResponse.json({ error: "This repair is already paid." }, { status: 400 });

        const services = repairServices(f.Issue ?? "");
        const name = `Repair ${reference}${services.length ? `: ${services.join(", ")}` : ""}`.slice(0, 250);
        const origin = new URL(request.url).origin;

        try {
            const session = await createInvoice({
                // Unique per attempt; the webhook reads the repair reference from the first 9 characters.
                reference: `${reference}-${Date.now().toString(36).toUpperCase()}`,
                email: user.email,
                lines: [{ name, amount: Math.round(quote * 100), quantity: 1 }],
                successUrl: `${origin}/orders?repairPaid=${reference}`,
                failureUrl: `${origin}/orders`,
            });
            return NextResponse.json({ url: session.url });
        } catch (err) {
            console.error("[repair pay] could not start payment:", err);
            return NextResponse.json({ error: "Payment could not be started. Please try again." }, { status: 502 });
        }
    } catch (err) {
        console.error("[repair pay] unexpected error:", err);
        return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
}

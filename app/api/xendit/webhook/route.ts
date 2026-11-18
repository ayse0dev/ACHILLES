import { NextResponse } from "next/server";
import { base } from "@/lib/airtable";
import { formulaString } from "@/lib/formula";
import { verifyCallbackToken } from "@/lib/xendit";
import { sendEmail } from "@/lib/mail";
import { notify } from "@/lib/notify";
import { appUrl } from "@/lib/verify";
import { repairPaid } from "@/lib/receipt";

export async function POST(request: Request) {
    if (!process.env.XENDIT_CALLBACK_TOKEN) {
        return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }
    if (!verifyCallbackToken(request.headers.get("x-callback-token"))) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const event = (await request.json().catch(() => null)) as {
        id?: string;
        external_id?: string;
        status?: string;
        amount?: number;
        paid_amount?: number;
    } | null;
    if (!event?.external_id || !event.id) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

    if (event.status !== "PAID" && event.status !== "SETTLED") return NextResponse.json({ received: true });

    const repairRef = /^RP-[A-Z0-9]{6}/.exec(event.external_id)?.[0];
    if (repairRef) return handleRepairPayment(repairRef, event.id, Number(event.paid_amount ?? event.amount ?? 0));

    const found = await base("Orders")
        .select({ filterByFormula: `{Reference} = ${formulaString(event.external_id)}`, maxRecords: 1 })
        .firstPage();
    const order = found[0];
    if (!order) return NextResponse.json({ received: true });

    const f = order.fields as { Reference?: string; Email?: string; Items?: string; Total?: number; Status?: string };
    if (f.Status && f.Status !== "Pending payment") return NextResponse.json({ received: true });

    const paid = Number(event.paid_amount ?? event.amount ?? 0);
    if (f.Total !== undefined && Math.abs(paid - f.Total) > 0.01) {
        // Amount mismatch: leave the order unpaid so staff can review it.
        return NextResponse.json({ received: true });
    }

    await base("Orders").update(order.id, { Status: "Paid", PaymentRef: event.id });

    if (f.Email) {
        const total = (f.Total ?? paid).toFixed(2);
        await sendEmail(
            f.Email,
            "Your ACHILLES order is confirmed",
            `Thanks for your order!\n\nReference: ${f.Reference}\nItems: ${f.Items}\nTotal: ₱${total}\n\nYour receipt: ${appUrl()}/orders/${f.Reference}\n\nYou can follow your delivery on the Orders page.`
        );
        await notify(f.Email, "Payment received", `Reference ${f.Reference}. Total ₱${total}.`, "/orders");
    }
    return NextResponse.json({ received: true });
}

async function handleRepairPayment(reference: string, invoiceId: string, paid: number) {
    const found = await base("RepairRequests")
        .select({ filterByFormula: `{Reference} = ${formulaString(reference)}`, maxRecords: 1 })
        .firstPage();
    const repair = found[0];
    if (!repair) return NextResponse.json({ received: true });

    const f = repair.fields as { Email?: string; Quote?: number; Issue?: string };
    const issue = f.Issue ?? "";
    if (repairPaid(issue)) return NextResponse.json({ received: true });

    const quote = Number(f.Quote ?? 0);
    if (quote <= 0 || Math.abs(paid - quote) > 0.01) {
        // Amount mismatch (for example the quote changed): leave it for staff to review.
        return NextResponse.json({ received: true });
    }

    await base("RepairRequests").update(repair.id, { Issue: `${issue}\nPaid online: ${quote.toFixed(2)} | ${invoiceId}` });

    if (f.Email) {
        await sendEmail(
            f.Email,
            "We received your ACHILLES repair payment",
            `Thanks! Your payment of ₱${quote.toFixed(2)} for repair ${reference} was received.\n\nYour service receipt will be available once the repair is completed: ${appUrl()}/orders/${reference}`
        );
        await notify(f.Email, "Repair payment received", `Reference ${reference}. ₱${quote.toFixed(2)}.`, "/orders");
    }
    return NextResponse.json({ received: true });
}

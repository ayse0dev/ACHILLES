import { NextResponse } from "next/server";
import { base } from "@/lib/airtable";
import { formulaString } from "@/lib/formula";
import { getCheckoutSession, verifySignature } from "@/lib/paymongo";
import { sendEmail } from "@/lib/mail";
import { notify } from "@/lib/notify";
import { newReference } from "@/lib/reference";
import { appUrl } from "@/lib/verify";

export async function POST(request: Request) {
    const secret = process.env.PAYMONGO_WEBHOOK_SECRET;
    if (!secret) {
        return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }

    const body = await request.text();
    if (!verifySignature(body, request.headers.get("paymongo-signature") ?? "", secret)) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let event: { data?: { attributes?: { type?: string; data?: { id?: string } } } };
    try {
        event = JSON.parse(body);
    } catch {
        return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const attrs = event.data?.attributes;
    if (attrs?.type !== "checkout_session.payment.paid" || !attrs.data?.id) {
        return NextResponse.json({ received: true });
    }

    const sessionId = attrs.data.id;

    const existing = await base("Orders")
        .select({ filterByFormula: `{PaymentRef} = ${formulaString(sessionId)}`, maxRecords: 1 })
        .firstPage();
    if (existing.length > 0) {
        return NextResponse.json({ received: true });
    }

    const session = await getCheckoutSession(sessionId);

    const orderId = session.metadata.orderId;
    if (orderId) {
        const order = await base("Orders").find(orderId).catch(() => null);
        if (!order) return NextResponse.json({ received: true });
        const f = order.fields as { Reference?: string; Email?: string; Items?: string; Total?: number; Status?: string };
        if (f.Status && f.Status !== "Pending payment") return NextResponse.json({ received: true });
        await base("Orders").update(orderId, { Status: "Paid", PaymentRef: sessionId });
        const to = f.Email || session.email;
        await sendEmail(
            to,
            "Your ACHILLES order is confirmed",
            `Thanks for your order!

Reference: ${f.Reference}
Items: ${f.Items}
Total: ₱${(f.Total ?? session.total).toFixed(2)}

Your receipt: ${appUrl()}/orders/${f.Reference}

You can follow your delivery on the Orders page.`
        );
        await notify(to, "Payment received", `Reference ${f.Reference}. Total ₱${(f.Total ?? session.total).toFixed(2)}.`, "/orders");
        return NextResponse.json({ received: true });
    }

    const reference = newReference("OR");

    await base("Orders").create({
        Reference: reference,
        Email: session.email,
        Items: session.items,
        Total: session.total,
        Status: "Paid",
        Discount: session.metadata.discount ?? "",
        DiscountId: session.metadata.idNumber ?? "",
        PaymentRef: sessionId,
        CreatedAt: new Date().toISOString(),
    });

    await sendEmail(
        session.email,
        "Your ACHILLES order is confirmed",
        `Thanks for your order!\n\nReference: ${reference}\nItems: ${session.items}\nTotal: ₱${session.total.toFixed(2)}\n\nYou can see your orders at any time on the Orders page.`
    );
    await notify(session.email, "Order confirmed", `Reference ${reference}. Total ₱${session.total.toFixed(2)}.`, "/orders");

    return NextResponse.json({ received: true });
}

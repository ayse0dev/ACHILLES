import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { base } from "@/lib/airtable";
import { getStripe } from "@/lib/stripe";
import { sendEmail } from "@/lib/mail";

export async function POST(request: Request) {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
        return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }

    const stripe = getStripe();
    const body = await request.text();
    const signature = request.headers.get("stripe-signature") ?? "";

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(body, signature, secret);
    } catch {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const lines = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });
        const items = lines.data.map((l) => `${l.description} x${l.quantity}`).join(", ");
        const total = (session.amount_total ?? 0) / 100;
        const email = session.customer_email ?? "";

        await base("Orders").create({
            Email: email,
            Items: items,
            Total: total,
            Status: "Paid",
            StripeSessionId: session.id,
            CreatedAt: new Date().toISOString(),
        });

        await sendEmail(
            email,
            "Your ACHILLES order is confirmed",
            `Thanks for your order!\n\nItems: ${items}\nTotal: ₱${total.toFixed(2)}\n\nYou can see your orders at any time on the Orders page.`
        );
    }

    return NextResponse.json({ received: true });
}

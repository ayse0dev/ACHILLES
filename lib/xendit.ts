import { timingSafeEqual } from "crypto";

const API = "https://api.xendit.co";

function authHeader() {
    const key = process.env.XENDIT_SECRET_KEY;
    if (!key) throw new Error("XENDIT_SECRET_KEY is not set");
    return `Basic ${Buffer.from(`${key}:`).toString("base64")}`;
}

export type CheckoutLine = { name: string; amount: number; quantity: number };

// Creates a hosted Xendit invoice page. Amounts in `lines` are in centavos.
// All payment methods enabled in the Xendit dashboard (GCash, Maya, cards, online banking) are offered.
export async function createInvoice(input: {
    reference: string;
    email: string;
    lines: CheckoutLine[];
    successUrl: string;
    failureUrl: string;
}): Promise<{ id: string; url: string }> {
    const items = input.lines.map((l) => ({ name: l.name.slice(0, 250), quantity: l.quantity, price: l.amount / 100 }));
    const amount = Math.round(input.lines.reduce((s, l) => s + l.amount * l.quantity, 0)) / 100;

    const res = await fetch(`${API}/v2/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: authHeader() },
        body: JSON.stringify({
            external_id: input.reference,
            amount,
            currency: "PHP",
            payer_email: input.email,
            description: `ACHILLES order ${input.reference}`,
            items,
            success_redirect_url: input.successUrl,
            failure_redirect_url: input.failureUrl,
            invoice_duration: 86400,
        }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.invoice_url) {
        throw new Error(`Xendit invoice failed (${res.status}): ${json?.error_code ?? ""} ${json?.message ?? ""}`.trim());
    }
    return { id: String(json.id), url: String(json.invoice_url) };
}

export function verifyCallbackToken(header: string | null): boolean {
    const secret = process.env.XENDIT_CALLBACK_TOKEN;
    if (!secret || !header) return false;
    const a = Buffer.from(header);
    const b = Buffer.from(secret);
    return a.length === b.length && timingSafeEqual(a, b);
}

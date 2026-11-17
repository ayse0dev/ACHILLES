import { createHmac, timingSafeEqual } from "crypto";

const API = "https://api.paymongo.com/v1";

function authHeader() {
    const key = process.env.PAYMONGO_SECRET_KEY;
    if (!key) throw new Error("PAYMONGO_SECRET_KEY is not set");
    return `Basic ${Buffer.from(`${key}:`).toString("base64")}`;
}

export type CheckoutLine = { name: string; amount: number; quantity: number };

export async function createCheckoutSession(input: {
    lines: CheckoutLine[];
    email: string;
    successUrl: string;
    cancelUrl: string;
    methods: string[];
    metadata: Record<string, string>;
}): Promise<{ id: string; url: string }> {
    const res = await fetch(`${API}/checkout_sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: authHeader() },
        body: JSON.stringify({
            data: {
                attributes: {
                    line_items: input.lines.map((l) => ({ currency: "PHP", amount: l.amount, name: l.name, quantity: l.quantity })),
                    payment_method_types: input.methods,
                    billing: { email: input.email },
                    customer_email: input.email,
                    success_url: input.successUrl,
                    cancel_url: input.cancelUrl,
                    send_email_receipt: false,
                    description: "ACHILLES order",
                    metadata: input.metadata,
                },
            },
        }),
    });
    const json = await res.json();
    const url = json?.data?.attributes?.checkout_url;
    if (!res.ok || !url) throw new Error("PayMongo checkout failed");
    return { id: String(json.data.id), url: String(url) };
}

export type PaidSession = {
    id: string;
    email: string;
    items: string;
    total: number;
    metadata: Record<string, string>;
};

export async function getCheckoutSession(id: string): Promise<PaidSession> {
    const res = await fetch(`${API}/checkout_sessions/${encodeURIComponent(id)}`, {
        headers: { Accept: "application/json", Authorization: authHeader() },
        cache: "no-store",
    });
    const json = await res.json();
    if (!res.ok) throw new Error("Could not read checkout session");

    const a = json.data.attributes as {
        line_items?: { name?: string; quantity?: number; amount?: number }[];
        billing?: { email?: string };
        customer_email?: string;
        metadata?: Record<string, string>;
    };
    const lines = a.line_items ?? [];
    const cents = lines.reduce((s, l) => s + Number(l.amount ?? 0) * Number(l.quantity ?? 1), 0);

    return {
        id,
        email: a.metadata?.email || a.customer_email || a.billing?.email || "",
        items: lines.map((l) => `${l.name} x${l.quantity}`).join(", "),
        total: cents / 100,
        metadata: a.metadata ?? {},
    };
}

function safeEqual(a: string, b: string) {
    const x = Buffer.from(a);
    const y = Buffer.from(b);
    return x.length === y.length && timingSafeEqual(x, y);
}

export function verifySignature(rawBody: string, header: string, secret: string): boolean {
    if (!header) return false;
    const hmac = (payload: string) => createHmac("sha256", secret).update(payload).digest("hex");

    if (safeEqual(header.trim(), hmac(rawBody))) return true;

    const parts = Object.fromEntries(
        header.split(",").map((p) => {
            const i = p.indexOf("=");
            return [p.slice(0, i).trim(), p.slice(i + 1).trim()];
        })
    ) as Record<string, string>;

    if (!parts.t) return false;
    const expected = hmac(`${parts.t}.${rawBody}`);
    return [parts.te, parts.li].filter(Boolean).some((sig) => safeEqual(sig, expected));
}

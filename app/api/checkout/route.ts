import { hit, ipFrom } from "@/lib/rateLimit";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/session";
import { getProductBySlug } from "@/lib/products";
import { createCheckoutSession } from "@/lib/paymongo";

const schema = z.object({
    items: z
        .array(
            z.object({
                slug: z.string().min(1),
                size: z.string().min(1),
                qty: z.number().int().min(1).max(20),
            })
        )
        .min(1)
        .max(30),
    discount: z.enum(["none", "student", "senior", "pwd"]).default("none"),
    idNumber: z.string().trim().max(40).optional(),
});

export async function POST(request: Request) {
    if (!hit(`checkout:${ipFrom(request.headers)}`, 10, 60000)) {
        return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: "Log in to checkout." }, { status: 401 });
    }

    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid cart." }, { status: 400 });
    }

    const discount = parsed.data.discount;
    if (discount !== "none" && !parsed.data.idNumber) {
        return NextResponse.json({ error: "Enter your ID number to use a discount." }, { status: 400 });
    }
    const rate = discount === "none" ? 1 : 0.8;

    const lineItems = [];
    for (const item of parsed.data.items) {
        const product = await getProductBySlug(item.slug);
        if (!product) {
            return NextResponse.json({ error: `Unknown product: ${item.slug}` }, { status: 400 });
        }
        if (!product.sizes.includes(item.size)) {
            return NextResponse.json({ error: `${product.name} is not available in size ${item.size}.` }, { status: 400 });
        }
        if (product.stock < item.qty) {
            return NextResponse.json({ error: `Not enough stock for ${product.name}.` }, { status: 409 });
        }
        lineItems.push({
            quantity: item.qty,
            amount: Math.round(product.price * 100 * rate),
            name: `${product.name} (size ${item.size})`,
        });
    }

    const origin = new URL(request.url).origin;

    try {
        const session = await createCheckoutSession({
            lines: lineItems,
            email: user.email,
            successUrl: `${origin}/orders?paid=1`,
            cancelUrl: `${origin}/cart`,
            metadata: {
                email: user.email,
                ...(discount === "none" ? {} : { discount, idNumber: parsed.data.idNumber ?? "" }),
            },
        });
        return NextResponse.json({ url: session.url });
    } catch {
        return NextResponse.json({ error: "Payment could not be started. Please try again." }, { status: 502 });
    }
}

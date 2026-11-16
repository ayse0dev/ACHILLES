import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/session";
import { getProductBySlug } from "@/lib/products";
import { getStripe } from "@/lib/stripe";

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
});

export async function POST(request: Request) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: "Log in to checkout." }, { status: 401 });
    }

    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid cart." }, { status: 400 });
    }

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
            price_data: {
                currency: "usd",
                unit_amount: Math.round(product.price * 100),
                product_data: { name: `${product.name} (size ${item.size})` },
            },
        });
    }

    const origin = new URL(request.url).origin;
    const session = await getStripe().checkout.sessions.create({
        mode: "payment",
        customer_email: user.email,
        line_items: lineItems,
        success_url: `${origin}/orders?paid=1`,
        cancel_url: `${origin}/cart`,
    });

    return NextResponse.json({ url: session.url });
}

import { hit, ipFrom } from "@/lib/rateLimit";
import { NextResponse } from "next/server";
import { z } from "zod";
import { base } from "@/lib/airtable";
import { getCurrentUser } from "@/lib/session";
import { getProductBySlug } from "@/lib/products";
import { priceOf } from "@/lib/price";
import { createCheckoutSession } from "@/lib/paymongo";
import { addressFields, findOwnedAddress, listAddresses } from "@/lib/addresses";
import { addressLine, addressSchema } from "@/lib/addressTypes";
import { normalizePhone } from "@/lib/phone";
import { checkVoucher, redeemVoucher } from "@/lib/vouchers";
import { newReference } from "@/lib/reference";
import { sendEmail } from "@/lib/mail";
import { notify } from "@/lib/notify";
import { shopBank } from "@/lib/business";

const METHODS = {
    online: ["gcash", "paymaya", "card"],
    banking: ["dob", "dob_ubp"],
} as const;

const schema = z.object({
    items: z
        .array(z.object({ slug: z.string().min(1), size: z.string().min(1), qty: z.number().int().min(1).max(20) }))
        .min(1)
        .max(30),
    discount: z.enum(["none", "student", "senior", "pwd"]).default("none"),
    idNumber: z.string().trim().max(40).optional(),
    phone: z.string().trim().max(20),
    addressId: z.string().max(40).optional(),
    newAddress: addressSchema.optional(),
    saveAddress: z.boolean().optional(),
    payment: z.enum(["online", "banking", "bank_transfer", "cod"]),
    voucher: z.string().trim().max(30).optional(),
});

export async function POST(request: Request) {
    if (!hit(`checkout:${ipFrom(request.headers)}`, 10, 60000)) {
        return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Log in to checkout." }, { status: 401 });

    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Please complete the delivery details." }, { status: 400 });
    const data = parsed.data;

    const phone = normalizePhone(data.phone);
    if (!phone) return NextResponse.json({ error: "Enter a valid mobile number like +63-9xx-xxx-xxxx." }, { status: 400 });

    let address: { line: string; lat: number | null; lng: number | null } | null = null;
    if (data.addressId) {
        const owned = await findOwnedAddress(user.email, data.addressId);
        if (!owned) return NextResponse.json({ error: "That saved address was not found." }, { status: 400 });
        address = { line: addressLine(owned), lat: owned.lat, lng: owned.lng };
    } else if (data.newAddress) {
        address = { line: addressLine(data.newAddress), lat: data.newAddress.lat, lng: data.newAddress.lng };
    }
    if (!address) return NextResponse.json({ error: "A delivery address is required." }, { status: 400 });

    if (data.discount !== "none" && !data.idNumber) {
        return NextResponse.json({ error: "Enter your ID number to use a discount." }, { status: 400 });
    }
    const idRate = data.discount === "none" ? 1 : 0.8;

    const lines: { name: string; amount: number; quantity: number }[] = [];
    for (const item of data.items) {
        const product = await getProductBySlug(item.slug);
        if (!product) return NextResponse.json({ error: `Unknown product: ${item.slug}` }, { status: 400 });
        if (!product.sizes.includes(item.size)) {
            return NextResponse.json({ error: `${product.name} is not available in size ${item.size}.` }, { status: 400 });
        }
        if (product.stock < item.qty) return NextResponse.json({ error: `Not enough stock for ${product.name}.` }, { status: 409 });
        lines.push({ quantity: item.qty, amount: Math.round(priceOf(product) * 100 * idRate), name: `${product.name} (size ${item.size})` });
    }

    const subtotalCents = lines.reduce((s, l) => s + l.amount * l.quantity, 0);
    let voucherCode = "";
    let voucherOff = 0;
    let voucherRef = null as Awaited<ReturnType<typeof checkVoucher>> | null;
    if (data.voucher) {
        voucherRef = await checkVoucher(data.voucher, subtotalCents / 100);
        if (!voucherRef.ok) return NextResponse.json({ error: voucherRef.error }, { status: 400 });
        voucherCode = voucherRef.voucher.code;
        voucherOff = voucherRef.off;
        const factor = (subtotalCents / 100 - voucherOff) / (subtotalCents / 100);
        for (const l of lines) l.amount = Math.max(1, Math.round(l.amount * factor));
    }
    const totalCents = lines.reduce((s, l) => s + l.amount * l.quantity, 0);
    const total = totalCents / 100;

    if (data.payment === "cod" && total > 20000) {
        return NextResponse.json({ error: "Cash on delivery is limited to orders up to ₱20,000. Please choose another payment method." }, { status: 400 });
    }

    if (data.newAddress && data.saveAddress) {
        const existing = await listAddresses(user.email);
        if (existing.length < 10) {
            await base("Addresses").create(addressFields(user.email, data.newAddress, existing.length === 0)).catch(() => null);
        }
    }

    const reference = newReference("OR");
    const items = lines.map((l) => `${l.name} x${l.quantity}`).join(", ");
    const status = data.payment === "cod" ? "Confirmed" : "Pending payment";

    const record = await base("Orders").create({
        Reference: reference,
        Email: user.email,
        Name: user.name ?? "",
        Items: items,
        Lines: JSON.stringify(lines.map((l) => ({ name: l.name, qty: l.quantity, unit: l.amount / 100 }))),
        Total: total,
        Status: status,
        Discount: data.discount === "none" ? "" : data.discount,
        DiscountId: data.idNumber ?? "",
        Voucher: voucherCode,
        VoucherOff: voucherOff,
        PaymentMethod: data.payment,
        Phone: phone,
        Address: address.line,
        ...(address.lat !== null && address.lng !== null ? { Lat: address.lat, Lng: address.lng } : {}),
        CreatedAt: new Date().toISOString(),
    });
    if (voucherRef && voucherRef.ok) await redeemVoucher(voucherRef.voucher);

    if (data.payment === "cod" || data.payment === "bank_transfer") {
        const bankText = shopBank.accountNumber
            ? `\n\nPlease send ₱${total.toFixed(2)} to ${shopBank.bank}, account name ${shopBank.accountName}, account number ${shopBank.accountNumber}, and use ${reference} as the reference.`
            : `\n\nWe will message you the bank details for your transfer of ₱${total.toFixed(2)}. Use ${reference} as the reference.`;
        const how = data.payment === "cod" ? "You will pay in cash when your order arrives." : `Your order will be packed once we confirm your bank transfer.${bankText}`;
        await sendEmail(
            user.email,
            "We received your ACHILLES order",
            `Thanks for your order!\n\nReference: ${reference}\nItems: ${items}\nTotal: ₱${total.toFixed(2)}\nDeliver to: ${address.line}\nContact: ${phone}\n\n${how}`
        );
        await notify(user.email, "Order received", `Reference ${reference}. Total ₱${total.toFixed(2)}.`, "/orders");
        return NextResponse.json({ redirect: `/orders?placed=${reference}` });
    }

    const origin = new URL(request.url).origin;
    try {
        const session = await createCheckoutSession({
            lines,
            email: user.email,
            successUrl: `${origin}/orders/${reference}?paid=1`,
            cancelUrl: `${origin}/cart`,
            methods: [...METHODS[data.payment]],
            metadata: { email: user.email, orderId: record.id },
        });
        return NextResponse.json({ url: session.url });
    } catch {
        await base("Orders").update(record.id, { Status: "Cancelled" });
        return NextResponse.json({ error: "Payment could not be started. Please try again or choose another method." }, { status: 502 });
    }
}

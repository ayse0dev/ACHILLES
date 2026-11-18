import { getCurrentUser } from "@/lib/session";
import { buildReceiptPdf, isReceiptReady, loadReceipt } from "@/lib/receipt";
import { hit, ipFrom } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(req: Request, ctx: { params: Promise<{ reference: string }> }) {
    if (!hit(`receipt:${ipFrom(req.headers)}`, 20, 60000)) {
        return new Response("Too many requests", { status: 429 });
    }
    const user = await getCurrentUser();
    if (!user) return new Response("Log in to download your receipt.", { status: 401 });
    const { reference } = await ctx.params;
    const receipt = await loadReceipt(reference.toUpperCase(), user).catch(() => null);
    if (!receipt) return new Response("Receipt not found.", { status: 404 });
    if (!isReceiptReady(receipt)) return new Response("This transaction has not been paid yet.", { status: 409 });

    let logo: Uint8Array | null = null;
    try {
        const res = await fetch(new URL("/logo.png", req.url));
        if (res.ok) logo = new Uint8Array(await res.arrayBuffer());
    } catch {
        logo = null;
    }

    const pdf = await buildReceiptPdf(receipt, logo);
    return new Response(Buffer.from(pdf), {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="ACHILLES-receipt-${receipt.reference}.pdf"`,
            "Cache-Control": "private, no-store",
        },
    });
}

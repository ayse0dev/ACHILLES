import { NextResponse } from "next/server";
import { z } from "zod";
import { hit, ipFrom } from "@/lib/rateLimit";
import { getCurrentUser } from "@/lib/session";
import { checkVoucher } from "@/lib/vouchers";

const schema = z.object({ code: z.string().trim().max(30), subtotal: z.number().min(0).max(1000000) });

export async function POST(req: Request) {
    if (!hit(`voucher:${ipFrom(req.headers)}`, 15, 60000)) {
        return NextResponse.json({ error: "Too many tries. Please wait a moment." }, { status: 429 });
    }
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Enter a voucher code." }, { status: 400 });
    const result = await checkVoucher(parsed.data.code, parsed.data.subtotal);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ code: result.voucher.code, off: result.off });
}

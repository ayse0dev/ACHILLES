import { createHash } from "crypto";
import { base } from "@/lib/airtable";
import { hit, ipFrom } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

const ID = /^rec[A-Za-z0-9]{14}$/;

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
    if (!hit(`avatar:${ipFrom(req.headers)}`, 120, 60000)) {
        return new Response("Too many requests", { status: 429 });
    }
    const { id } = await ctx.params;
    if (!ID.test(id)) return new Response("Not found", { status: 404 });

    let data = "";
    try {
        const record = await base("Users").find(id);
        data = String((record.fields as { Avatar?: string }).Avatar ?? "");
    } catch {
        return new Response("Not found", { status: 404 });
    }

    const match = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(data);
    if (!match) return new Response("Not found", { status: 404 });

    const etag = `"${createHash("sha1").update(data).digest("hex")}"`;
    if (req.headers.get("if-none-match") === etag) {
        return new Response(null, { status: 304, headers: { ETag: etag } });
    }
    return new Response(Buffer.from(match[1], "base64"), {
        headers: {
            "Content-Type": "image/jpeg",
            "Cache-Control": "private, max-age=30, must-revalidate",
            ETag: etag,
            "Content-Security-Policy": "default-src 'none'",
        },
    });
}

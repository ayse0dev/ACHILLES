import { base } from "@/lib/airtable";
import { getCurrentUser } from "@/lib/session";
import { isStaff } from "@/lib/roles";

export const dynamic = "force-dynamic";

const ID = /^rec[A-Za-z0-9]{14}$/;

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
    const user = await getCurrentUser();
    if (!user || !isStaff(user.role)) return new Response("Forbidden", { status: 403 });
    const { id } = await ctx.params;
    if (!ID.test(id)) return new Response("Not found", { status: 404 });
    try {
        const record = await base("RepairRequests").find(id);
        const data = String((record.fields as { Photo?: string }).Photo ?? "");
        const match = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(data);
        if (!match) return new Response("Not found", { status: 404 });
        return new Response(Buffer.from(match[1], "base64"), {
            headers: {
                "Content-Type": "image/jpeg",
                "Cache-Control": "private, max-age=60",
                "Content-Security-Policy": "default-src 'none'",
            },
        });
    } catch {
        return new Response("Not found", { status: 404 });
    }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/session";
import { isStaff } from "@/lib/roles";
import { audit } from "@/lib/audit";
import { addMessage, CLOSED_TEXT, inbox, SESSION_PATTERN, sessionMessages } from "@/lib/liveChat";

export const dynamic = "force-dynamic";

const replySchema = z.object({
    session: z.string().regex(SESSION_PATTERN),
    body: z.string().trim().min(1).max(500),
    close: z.boolean().optional(),
});

async function staffUser() {
    const user = await getCurrentUser();
    return user && isStaff(user.role) ? user : null;
}

export async function GET(req: Request) {
    const user = await staffUser();
    if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const session = new URL(req.url).searchParams.get("session");
    try {
        if (session) {
            if (!SESSION_PATTERN.test(session)) return NextResponse.json({ error: "Bad session" }, { status: 400 });
            return NextResponse.json({ messages: await sessionMessages(session) });
        }
        return NextResponse.json({ items: await inbox() });
    } catch {
        return NextResponse.json({ error: "Unavailable" }, { status: 503 });
    }
}

export async function POST(req: Request) {
    const user = await staffUser();
    if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const parsed = replySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    const { session, body, close } = parsed.data;
    const name = (user.name || "ACHILLES team").slice(0, 60);
    try {
        if (close) {
            await addMessage(session, name, "System", CLOSED_TEXT);
            await audit(user.email, "live_chat_close", session);
        } else {
            await addMessage(session, name, "Staff", body);
        }
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: "Could not send" }, { status: 503 });
    }
}

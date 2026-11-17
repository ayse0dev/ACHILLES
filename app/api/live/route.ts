import { NextResponse } from "next/server";
import { z } from "zod";
import { hit, ipFrom } from "@/lib/rateLimit";
import { supportOnline } from "@/lib/supportHours";
import { addMessage, CLOSED_TEXT, SESSION_PATTERN, sessionMessages } from "@/lib/liveChat";

export const dynamic = "force-dynamic";

const sendSchema = z.object({
    session: z.string().regex(SESSION_PATTERN),
    name: z.string().trim().min(1).max(60),
    body: z.string().trim().min(1).max(500),
    end: z.boolean().optional(),
});

export async function GET(req: Request) {
    if (!hit(`livepoll:${ipFrom(req.headers)}`, 90, 60000)) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
    const session = new URL(req.url).searchParams.get("session") ?? "";
    if (!SESSION_PATTERN.test(session)) return NextResponse.json({ error: "Bad session" }, { status: 400 });
    try {
        const messages = await sessionMessages(session);
        return NextResponse.json({ messages, online: supportOnline() });
    } catch {
        return NextResponse.json({ error: "Unavailable" }, { status: 503 });
    }
}

export async function POST(req: Request) {
    if (!hit(`livesend:${ipFrom(req.headers)}`, 30, 60000)) {
        return NextResponse.json({ error: "You are sending too fast. Please wait a moment." }, { status: 429 });
    }
    const parsed = sendSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Please type a message (up to 500 characters)." }, { status: 400 });
    const { session, name, body, end } = parsed.data;

    if (!end && !supportOnline()) {
        return NextResponse.json(
            { error: "Live support is offline now (9 AM – 10 PM). Please send a ticket at /support." },
            { status: 403 }
        );
    }
    try {
        if (end) {
            await addMessage(session, name, "System", CLOSED_TEXT);
        } else {
            await addMessage(session, name, "Customer", body);
        }
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: "Could not send. Please try again." }, { status: 503 });
    }
}

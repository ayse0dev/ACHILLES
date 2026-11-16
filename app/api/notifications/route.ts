import { NextResponse } from "next/server";
import { base } from "@/lib/airtable";
import { formulaString } from "@/lib/formula";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ items: [], unread: 0 });

    try {
        const records = await base("Notifications")
            .select({
                filterByFormula: `{Email} = ${formulaString(user.email.toLowerCase())}`,
                sort: [{ field: "CreatedAt", direction: "desc" }],
                maxRecords: 15,
            })
            .firstPage();

        const items = records.map((r) => {
            const f = r.fields as { Title?: string; Body?: string; Link?: string; Read?: boolean; CreatedAt?: string };
            return { id: r.id, title: f.Title ?? "", body: f.Body ?? "", link: f.Link ?? "", read: !!f.Read, createdAt: f.CreatedAt ?? "" };
        });
        return NextResponse.json({ items, unread: items.filter((i) => !i.read).length });
    } catch {
        return NextResponse.json({ items: [], unread: 0 });
    }
}

export async function POST() {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ ok: false }, { status: 401 });

    try {
        const records = await base("Notifications")
            .select({
                filterByFormula: `AND({Email} = ${formulaString(user.email.toLowerCase())}, NOT({Read}))`,
                maxRecords: 50,
            })
            .firstPage();
        for (let i = 0; i < records.length; i += 10) {
            await base("Notifications").update(records.slice(i, i + 10).map((r) => ({ id: r.id, fields: { Read: true } })));
        }
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}

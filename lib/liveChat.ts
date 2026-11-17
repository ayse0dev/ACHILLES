import { base } from "./airtable";
import { formulaString } from "./formula";

export type LiveMessage = {
    id: string;
    session: string;
    name: string;
    sender: "Customer" | "Staff" | "System";
    body: string;
    createdAt: string;
};

export const SESSION_PATTERN = /^[A-Za-z0-9]{20,40}$/;
export const CLOSED_TEXT = "Chat ended";

type Fields = { Session?: string; Name?: string; Sender?: string; Body?: string; CreatedAt?: string };

function toMessage(r: { id: string; fields: Fields }): LiveMessage {
    const f = r.fields;
    const sender = f.Sender === "Staff" || f.Sender === "System" ? f.Sender : "Customer";
    return {
        id: r.id,
        session: f.Session ?? "",
        name: f.Name ?? "",
        sender,
        body: f.Body ?? "",
        createdAt: f.CreatedAt ?? "",
    };
}

export async function addMessage(session: string, name: string, sender: LiveMessage["sender"], body: string) {
    await base("LiveMessages").create({
        Session: session,
        Name: name.slice(0, 60),
        Sender: sender,
        Body: body.slice(0, 600),
        CreatedAt: new Date().toISOString(),
    });
}

export async function sessionMessages(session: string): Promise<LiveMessage[]> {
    const records = await base("LiveMessages")
        .select({
            filterByFormula: `{Session} = ${formulaString(session)}`,
            sort: [{ field: "CreatedAt", direction: "asc" }],
            maxRecords: 200,
        })
        .firstPage();
    return records.map((r) => toMessage(r as unknown as { id: string; fields: Fields }));
}

export type InboxItem = {
    session: string;
    name: string;
    lastBody: string;
    lastAt: string;
    lastSender: LiveMessage["sender"];
    closed: boolean;
    waiting: boolean;
    count: number;
};

export async function inbox(): Promise<InboxItem[]> {
    const records = await base("LiveMessages")
        .select({ sort: [{ field: "CreatedAt", direction: "desc" }], maxRecords: 300 })
        .firstPage();
    const groups = new Map<string, InboxItem>();
    for (const r of records) {
        const m = toMessage(r as unknown as { id: string; fields: Fields });
        if (!m.session) continue;
        const existing = groups.get(m.session);
        if (!existing) {
            groups.set(m.session, {
                session: m.session,
                name: m.sender === "Customer" ? m.name : "",
                lastBody: m.body,
                lastAt: m.createdAt,
                lastSender: m.sender,
                closed: m.sender === "System",
                waiting: m.sender === "Customer",
                count: 1,
            });
        } else {
            existing.count += 1;
            if (!existing.name && m.sender === "Customer") existing.name = m.name;
        }
    }
    return Array.from(groups.values()).map((g) => ({ ...g, name: g.name || "Customer" }));
}

import { NextResponse } from "next/server";
import { hit, ipFrom } from "@/lib/rateLimit";

const BASE = "https://psgc.gitlab.io/api";
const CODE = /^\d{9,10}$/;

type Raw = { code: string; name: string };

export async function GET(req: Request) {
    if (!hit(`psgc:${ipFrom(req.headers)}`, 120, 60000)) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
    const params = new URL(req.url).searchParams;
    const type = params.get("type");
    const parent = params.get("parent") ?? "";

    let url = "";
    if (type === "regions") url = `${BASE}/regions/`;
    else if (type === "cities" && CODE.test(parent)) url = `${BASE}/regions/${parent}/cities-municipalities/`;
    else if (type === "barangays" && CODE.test(parent)) url = `${BASE}/cities-municipalities/${parent}/barangays/`;
    else return NextResponse.json({ error: "Bad request" }, { status: 400 });

    try {
        const res = await fetch(url, { next: { revalidate: 86400 } });
        if (!res.ok) return NextResponse.json({ error: "Unavailable" }, { status: 502 });
        const raw = (await res.json()) as Raw[];
        const items = raw
            .map((r) => ({ code: r.code, name: r.name }))
            .sort((a, b) => a.name.localeCompare(b.name));
        return NextResponse.json({ items });
    } catch {
        return NextResponse.json({ error: "Unavailable" }, { status: 502 });
    }
}

import { NextResponse } from "next/server";
import { hit, ipFrom } from "@/lib/rateLimit";

type Nominatim = {
    address?: Record<string, string>;
};

export async function GET(req: Request) {
    if (!hit(`geocode:${ipFrom(req.headers)}`, 30, 60000)) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
    const params = new URL(req.url).searchParams;
    const lat = Number(params.get("lat"));
    const lng = Number(params.get("lng"));
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < 4 || lat > 22 || lng < 116 || lng > 128) {
        return NextResponse.json({ error: "Location is outside the Philippines." }, { status: 400 });
    }
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=18&accept-language=en&lat=${lat}&lon=${lng}`,
            { headers: { "User-Agent": "ACHILLES-shop-checkout" }, cache: "no-store" }
        );
        if (!res.ok) return NextResponse.json({ error: "Unavailable" }, { status: 502 });
        const a = ((await res.json()) as Nominatim).address ?? {};
        const pick = (...keys: string[]) => keys.map((k) => a[k]).filter(Boolean);
        return NextResponse.json({
            regions: pick("region", "state", "state_district"),
            cities: pick("city", "town", "municipality", "village", "county"),
            barangays: pick("quarter", "suburb", "neighbourhood", "village", "hamlet", "city_district"),
            street: [a.house_number, a.road].filter(Boolean).join(" "),
        });
    } catch {
        return NextResponse.json({ error: "Unavailable" }, { status: 502 });
    }
}

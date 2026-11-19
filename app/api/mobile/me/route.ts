import { NextResponse } from "next/server";
import { base } from "@/lib/airtable";
import { getCurrentUser } from "@/lib/session";
import { listAddresses } from "@/lib/addresses";
import { addressLine } from "@/lib/addressTypes";

export const dynamic = "force-dynamic";

export async function GET() {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });
    const record = await base("Users").find(user.id);
    const phone = String((record.fields as { Phone?: string }).Phone ?? "");
    const addresses = (await listAddresses(user.email)).map((a) => ({ id: a.id, label: a.label, line: addressLine(a), home: a.home }));
    return NextResponse.json({ user, phone, addresses });
}

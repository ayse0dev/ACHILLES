import { NextResponse } from "next/server";
import { base } from "@/lib/airtable";
import { formulaString } from "@/lib/formula";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });
    const records = await base("Orders")
        .select({
            filterByFormula: `LOWER({Email}) = LOWER(${formulaString(user.email)})`,
            sort: [{ field: "CreatedAt", direction: "desc" }],
            maxRecords: 50,
        })
        .firstPage();
    const orders = records.map((r) => {
        const f = r.fields as { Reference?: string; Items?: string; Total?: number; Status?: string; CreatedAt?: string; Address?: string; PaymentMethod?: string };
        return {
            reference: f.Reference ?? "",
            items: f.Items ?? "",
            total: f.Total ?? 0,
            status: f.Status ?? "",
            createdAt: f.CreatedAt ?? "",
            address: f.Address ?? "",
            payment: f.PaymentMethod ?? "",
        };
    });
    return NextResponse.json({ orders });
}

import Link from "next/link";
import { base } from "@/lib/airtable";
import { formulaString } from "@/lib/formula";
import { formatMoney, paymentLabel, PAID_STATUSES, REPAIR_DONE, repairPayment, repairServices } from "@/lib/receipt";

type Fields = {
    Reference?: string;
    Items?: string;
    Total?: number;
    Status?: string;
    CreatedAt?: string;
    PaymentMethod?: string;
};

const statusStyle: Record<string, string> = {
    Paid: "bg-teal/25",
    Packed: "bg-yellow/40",
    Shipped: "bg-orange/30",
    Delivered: "bg-[#7ad39a]/50",
    Confirmed: "bg-purple/15",
    "Pending payment": "bg-ink/10",
    Cancelled: "bg-red/20",
    Pending: "bg-ink/10",
    "In progress": "bg-yellow/40",
    Ready: "bg-teal/25",
    Completed: "bg-[#7ad39a]/50",
};

type RepairFields = {
    Reference?: string;
    ShoeDescription?: string;
    Issue?: string;
    Status?: string;
    Quote?: number;
    SubmittedAt?: string;
};

type Row = {
    id: string;
    kind: "Order" | "Repair";
    reference: string;
    date: string;
    items: string;
    payment: string;
    total: number | null;
    status: string;
    receipt: boolean;
};

export default async function TransactionHistory({ email, userId }: { email: string; userId: string }) {
    let records: { id: string; fields: Fields }[] = [];
    let repairs: { id: string; fields: RepairFields }[] = [];
    try {
        const found = await base("Orders")
            .select({
                filterByFormula: `LOWER({Email}) = LOWER(${formulaString(email)})`,
                sort: [{ field: "CreatedAt", direction: "desc" }],
                maxRecords: 100,
            })
            .firstPage();
        records = found.map((r) => ({ id: r.id, fields: r.fields as Fields }));
    } catch {
        records = [];
    }

    try {
        const found = await base("RepairRequests")
            .select({
                filterByFormula: `OR(LOWER({Email}) = LOWER(${formulaString(email)}), {UserId} = ${formulaString(userId)})`,
                sort: [{ field: "SubmittedAt", direction: "desc" }],
                maxRecords: 100,
            })
            .firstPage();
        repairs = found.map((r) => ({ id: r.id, fields: r.fields as RepairFields }));
    } catch {
        repairs = [];
    }

    const rows: Row[] = [
        ...records.map((r): Row => ({
            id: r.id,
            kind: "Order",
            reference: r.fields.Reference ?? "",
            date: r.fields.CreatedAt ?? "",
            items: r.fields.Items ?? "",
            payment: paymentLabel(r.fields.PaymentMethod ?? ""),
            total: Number(r.fields.Total ?? 0),
            status: r.fields.Status ?? "",
            receipt: PAID_STATUSES.includes(r.fields.Status ?? ""),
        })),
        ...repairs.map((r): Row => {
            const issue = r.fields.Issue ?? "";
            const services = repairServices(issue);
            const quote = Number(r.fields.Quote ?? 0);
            return {
                id: r.id,
                kind: "Repair",
                reference: r.fields.Reference ?? "",
                date: r.fields.SubmittedAt ?? "",
                items: [r.fields.ShoeDescription, services.join(", ")].filter(Boolean).join(" – "),
                payment: repairPayment(issue),
                total: quote > 0 ? quote : null,
                status: r.fields.Status ?? "",
                receipt: r.fields.Status === REPAIR_DONE && quote > 0,
            };
        }),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const spent = rows.filter((r) => r.receipt).reduce((sum, r) => sum + (r.total ?? 0), 0);

    return (
        <div className="p-8 space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="eyebrow mb-1">Your purchases</p>
                    <h2 className="font-display font-black text-3xl">Transaction history</h2>
                </div>
                <div className="flex gap-3">
                    <div className="rounded-2xl border-2 border-ink bg-white px-5 py-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-ink/50">Transactions</p>
                        <p className="font-black text-2xl">{rows.length}</p>
                    </div>
                    <div className="rounded-2xl border-2 border-ink bg-teal px-5 py-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-ink/60">Total paid</p>
                        <p className="font-black text-2xl">₱{formatMoney(spent)}</p>
                    </div>
                </div>
            </div>

            {rows.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-ink/25 p-10 text-center space-y-3">
                    <p className="font-bold">No transactions yet.</p>
                    <Link href="/shop" className="btn btn-ink">Browse shoes</Link>
                </div>
            ) : (
                <div className="rounded-2xl border-2 border-ink overflow-hidden bg-white">
                    <div className="hidden md:grid grid-cols-[1.1fr_1.1fr_2fr_1.2fr_1fr_1fr_1.3fr] gap-4 bg-ink text-white text-[11px] font-black uppercase tracking-widest px-5 py-3">
                        <span>Date</span>
                        <span>Type / Ref</span>
                        <span>Items</span>
                        <span>Payment</span>
                        <span className="text-right">Total</span>
                        <span>Status</span>
                        <span className="text-right">Receipt</span>
                    </div>
                    {rows.map((r, i) => {
                        const date = r.date ? new Date(r.date).toLocaleDateString("en-PH", { dateStyle: "medium", timeZone: "Asia/Manila" }) : "";
                        return (
                            <div
                                key={r.id}
                                className={`grid md:grid-cols-[1.1fr_1.1fr_2fr_1.2fr_1fr_1fr_1.3fr] gap-x-4 gap-y-1 px-5 py-4 items-center text-sm ${i % 2 === 0 ? "bg-[#f6f3fa]" : "bg-white"}`}
                            >
                                <span className="text-ink/70">{date}</span>
                                <span>
                                    <span className={`inline-block text-[10px] font-black uppercase rounded-full px-2 py-0.5 mr-2 ${r.kind === "Repair" ? "bg-purple/20" : "bg-orange/25"}`}>{r.kind}</span>
                                    <span className="font-mono font-bold">{r.reference}</span>
                                </span>
                                <span className="truncate" title={r.items}>{r.items}</span>
                                <span className="text-ink/70">{r.payment}</span>
                                <span className="md:text-right font-black">{r.total !== null ? `₱${formatMoney(r.total)}` : <span className="text-ink/40 font-normal">Quote pending</span>}</span>
                                <span>
                                    <span className={`inline-block text-[11px] font-bold rounded-full px-3 py-1 ${statusStyle[r.status] ?? "bg-ink/10"}`}>{r.status}</span>
                                </span>
                                <span className="flex md:justify-end gap-3 text-xs font-bold">
                                    {r.receipt && r.reference ? (
                                        <>
                                            <Link href={`/orders/${r.reference}`} className="underline">View</Link>
                                            <a href={`/api/receipt/${r.reference}`} className="rounded-full bg-ink text-white px-4 py-2 hover:bg-purple transition">PDF</a>
                                        </>
                                    ) : r.kind === "Repair" ? (
                                        <Link href="/track" className="underline">Track</Link>
                                    ) : (
                                        <span className="text-ink/40">Not paid yet</span>
                                    )}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

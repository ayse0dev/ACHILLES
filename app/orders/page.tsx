import Link from "next/link";
import DeliveryProgress from "@/components/DeliveryProgress";
import { base } from "@/lib/airtable";
import { formulaString } from "@/lib/formula";
import { getCurrentUser } from "@/lib/session";

export default async function OrdersPage({
    searchParams,
}: {
    searchParams: Promise<{ paid?: string; placed?: string }>;
}) {
    const { paid, placed } = await searchParams;
    const user = await getCurrentUser();

    if (!user) {
        return (
            <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
                <p className="eyebrow">Your orders</p>
                <h1 className="page-title">Log in to see your orders</h1>
                <Link href="/login?callbackUrl=/orders" className="btn btn-ink">Log in</Link>
            </div>
        );
    }

    const records = await base("Orders")
        .select({
            filterByFormula: `LOWER({Email}) = LOWER(${formulaString(user.email)})`,
            sort: [{ field: "CreatedAt", direction: "desc" }],
            maxRecords: 50,
        })
        .firstPage();

    return (
        <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
            <div>
                <p className="eyebrow mb-2">Your account</p>
                <h1 className="page-title">Your orders</h1>
            </div>

            {placed && (
                <p className="card p-4 text-sm font-bold">Order {placed.slice(0, 12)} placed! We will keep you posted by email and notifications.</p>
            )}

            {paid && (
                <p className="card p-4 text-sm font-bold">Thanks! Your payment went through. It can take a moment to appear here.</p>
            )}

            {records.length === 0 ? (
                <p className="text-ink/70">No orders yet. <Link href="/shop" className="underline font-bold">Shop now</Link>.</p>
            ) : (
                <ul className="space-y-4">
                    {records.map((r) => {
                        const f = r.fields as { Reference?: string; Items?: string; Total?: number; Status?: string; CreatedAt?: string; Address?: string; PaymentMethod?: string };
                        return (
                            <li key={r.id} className="card p-5 space-y-2">
                                <div className="flex justify-between gap-4">
                                    <p className="text-xs text-ink/60">
                                        {f.CreatedAt ? new Date(f.CreatedAt).toLocaleDateString("en-US", { dateStyle: "medium" }) : ""}
                                    </p>
                                    <span className="text-xs font-bold uppercase">{f.Status}</span>
                                </div>
                                {f.Reference && <p className="text-xs font-bold tracking-widest">{f.Reference}</p>}
                                <p className="text-sm">{f.Items}</p>
                                {f.Address && <p className="text-xs text-ink/60">Deliver to: {f.Address}</p>}
                                <DeliveryProgress status={f.Status ?? "Paid"} />
                                {f.Status === "Delivered" && f.Reference && (
                                    <Link href={`/reviews?ref=${f.Reference}`} className="underline font-bold text-sm">Review this order</Link>
                                )}
                                <div className="flex items-center justify-between gap-3">
                                    <p className="font-black text-purple">₱{(f.Total ?? 0).toFixed(2)}</p>
                                    {f.Reference && ["Paid", "Packed", "Shipped", "Delivered"].includes(f.Status ?? "") && (
                                        <Link href={`/orders/${f.Reference}`} className="underline font-bold text-sm">View receipt</Link>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

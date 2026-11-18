import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { discountLabel, formatMoney, isReceiptReady, loadReceipt, paymentLabel } from "@/lib/receipt";
import { contact } from "@/lib/business";
import AutoRefresh from "@/components/AutoRefresh";
import PrintButton from "@/components/PrintButton";
import ClearCart from "@/components/ClearCart";

export const dynamic = "force-dynamic";

export default async function ReceiptPage({
    params,
    searchParams,
}: {
    params: Promise<{ reference: string }>;
    searchParams: Promise<{ paid?: string }>;
}) {
    const { reference } = await params;
    const { paid } = await searchParams;
    const ref = reference.toUpperCase();
    const user = await getCurrentUser();

    if (!user) {
        return (
            <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
                <h1 className="page-title">Log in to see your receipt</h1>
                <Link href={`/login?callbackUrl=/orders/${ref}`} className="btn btn-ink">Log in</Link>
            </div>
        );
    }

    const receipt = await loadReceipt(ref, user).catch(() => null);
    if (!receipt) {
        return (
            <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
                <h1 className="page-title">Receipt not found</h1>
                <p className="text-ink/70">We could not find that order on your account.</p>
                <Link href="/orders" className="btn btn-ink">Back to orders</Link>
            </div>
        );
    }

    const justPaidOrder = receipt.kind === "order" && !!paid;

    if (!isReceiptReady(receipt)) {
        const waiting = receipt.kind === "order" && receipt.status === "Pending payment" && !!paid;
        return (
            <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-5">
                {justPaidOrder && <ClearCart />}
                {waiting && <AutoRefresh seconds={4} />}
                <p className="eyebrow">{receipt.reference}</p>
                <h1 className="page-title !text-3xl">{waiting ? "Confirming your payment..." : "Receipt not ready yet"}</h1>
                <p className="text-ink/70">
                    {waiting
                        ? "This page updates by itself as soon as your payment is confirmed."
                        : receipt.status === "Cancelled"
                          ? "This order was cancelled."
                          : receipt.kind === "repair"
                            ? "Your service receipt appears here once your repair is completed and paid."
                            : "Your receipt appears here once your payment is complete."}
                </p>
                <Link href="/orders" className="btn btn-ghost">Back to orders</Link>
            </div>
        );
    }

    const date = receipt.createdAt
        ? new Date(receipt.createdAt).toLocaleString("en-PH", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Manila" })
        : "";

    return (
        <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
            {justPaidOrder && <ClearCart />}
            <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
                <div>
                    <p className="eyebrow mb-1">Payment complete</p>
                    <h1 className="page-title !text-3xl">Your receipt</h1>
                </div>
                <div className="flex gap-3">
                    <a href={`/api/receipt/${receipt.reference}`} className="btn btn-accent">Download PDF</a>
                    <PrintButton />
                </div>
            </div>

            <article className="rounded-3xl overflow-hidden bg-white border-2 border-ink shadow-[0_14px_40px_rgba(27,19,64,0.15)]">
                <header className="bg-ink text-white px-7 py-6 flex items-center justify-between gap-4">
                    <img src="/logo.png" alt="ACHILLES" className="h-14 w-auto" />
                    <div className="text-right">
                        <p className="font-display font-black text-3xl tracking-wide">{receipt.title}</p>
                        <p className="font-mono font-bold text-yellow text-sm">{receipt.reference}</p>
                    </div>
                </header>
                <div className="grid grid-cols-4 h-2">
                    <span className="bg-teal" />
                    <span className="bg-orange" />
                    <span className="bg-purple" />
                    <span className="bg-yellow" />
                </div>

                <div className="p-7 space-y-7">
                    <div className="grid sm:grid-cols-2 gap-6 text-sm">
                        <div className="space-y-1">
                            <p className="text-[11px] font-black uppercase tracking-widest text-purple">Billed to</p>
                            <p className="font-black text-lg">{receipt.name || receipt.email}</p>
                            <p className="text-ink/70">{receipt.email}</p>
                            {receipt.phone && <p className="text-ink/70">{receipt.phone}</p>}
                        </div>
                        <div className="space-y-1">
                            <p className="text-[11px] font-black uppercase tracking-widest text-purple">Order details</p>
                            <p><span className="text-ink/60">Date:</span> <b>{date}</b></p>
                            <p><span className="text-ink/60">Payment:</span> <b>{paymentLabel(receipt.paymentMethod)}</b></p>
                            <p><span className="text-ink/60">Status:</span> <b>{receipt.status}</b></p>
                        </div>
                    </div>

                    {receipt.note && (
                        <div className="text-sm space-y-1">
                            <p className="text-[11px] font-black uppercase tracking-widest text-purple">{receipt.noteLabel}</p>
                            <p>{receipt.note}</p>
                        </div>
                    )}

                    <div className="rounded-2xl overflow-hidden border-2 border-ink">
                        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-6 bg-ink text-white text-[11px] font-black uppercase tracking-widest px-4 py-3">
                            <span>Item</span>
                            <span>Qty</span>
                            <span className="text-right">Price</span>
                            <span className="text-right">Amount</span>
                        </div>
                        {receipt.lines.map((l, i) => (
                            <div key={i} className={`grid grid-cols-[1fr_auto_auto_auto] gap-x-6 px-4 py-3 text-sm items-start ${i % 2 === 0 ? "bg-[#f6f3fa]" : ""}`}>
                                <span className="font-bold">{l.name}</span>
                                <span>{l.qty}</span>
                                <span className="text-right">{l.unit !== null ? `₱${formatMoney(l.unit)}` : ""}</span>
                                <span className="text-right font-bold">{l.unit !== null ? `₱${formatMoney(l.unit * l.qty)}` : ""}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <div className="space-y-1 text-xs text-ink/60">
                            {receipt.kind === "repair" && <p>Final price agreed for the services listed above.</p>}
                            {discountLabel(receipt.discount) && <p>{discountLabel(receipt.discount)} already applied to item prices.</p>}
                            {receipt.voucher && <p>Voucher {receipt.voucher} (−₱{formatMoney(receipt.voucherOff)}) already applied.</p>}
                            {receipt.paymentRef && <p className="font-mono">Payment ref: {receipt.paymentRef}</p>}
                        </div>
                        <div className="rounded-2xl bg-teal border-2 border-ink px-6 py-3 flex items-center gap-6">
                            <span className="text-xs font-black uppercase tracking-widest">Total paid</span>
                            <span className="font-black text-3xl">₱{formatMoney(receipt.total)}</span>
                        </div>
                    </div>

                    <div className="border-t border-ink/10 pt-5">
                        <p className="font-display font-black text-xl">Salamat sa iyong order!</p>
                        <p className="text-sm text-ink/70">Your shoes are in good hands. We service what we sell, with a 30-day workmanship warranty on repairs.</p>
                    </div>
                </div>

                <footer className="bg-ink text-white px-7 py-4 text-xs flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold">ACHILLES | Shoe repair &amp; shoe shop</span>
                    <span className="text-white/70">{contact.address} | {contact.hours}</span>
                </footer>
            </article>

            <div className="print:hidden text-center">
                <Link href="/orders" className="underline text-sm font-bold">Back to my orders</Link>
            </div>
        </div>
    );
}

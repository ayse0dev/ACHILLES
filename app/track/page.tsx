"use client";

import Link from "next/link";
import { useActionState } from "react";
import ProgressLine from "@/components/ProgressLine";
import DeliveryProgress from "@/components/DeliveryProgress";
import { lookupReference, TrackState } from "./actions";

const initial: TrackState = {};

export default function TrackPage() {
    const [state, formAction, isPending] = useActionState(lookupReference, initial);
    const r = state.result;

    return (
        <div className="max-w-xl mx-auto px-4 py-10 space-y-6">
            <div>
                <p className="eyebrow mb-2">Tracker</p>
                <h1 className="page-title">Where is my order?</h1>
                <p className="text-ink/70 mt-2">
                    Enter the reference number from your confirmation email. Repairs start with RP and shop orders with OR.
                </p>
            </div>

            <form action={formAction} className="card p-6 space-y-3">
                <input
                    name="reference"
                    placeholder="RP-4K7M2X"
                    required
                    autoCapitalize="characters"
                    className="field uppercase tracking-widest"
                />
                {state.error && <p className="text-red text-sm">{state.error}</p>}
                <button disabled={isPending} className="btn btn-accent w-full">
                    {isPending ? "Searching..." : "Track"}
                </button>
            </form>

            {state.searched && !r && (
                <p className="text-center text-ink/70">
                    We couldn&apos;t find that reference. <Link href="/contact" className="underline">Contact support</Link>.
                </p>
            )}

            {r && (
                <div className="card p-6 space-y-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="eyebrow">{r.kind}</p>
                            <p className="font-display font-bold text-xl">{r.title}</p>
                            <p className="text-xs text-ink/60">
                                {r.reference} · {r.submitted}
                            </p>
                        </div>
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal/25">{r.status}</span>
                    </div>
                    {r.kind === "Order" ? <DeliveryProgress status={r.status} /> : <ProgressLine steps={r.steps} current={r.status} />}
                    {r.note && <p className="text-sm font-bold">{r.note}</p>}
                    {r.kind !== "Ticket" && ["Completed", "Delivered"].includes(r.status) && (
                        <Link href={`/reviews?ref=${r.reference}`} className="btn btn-accent">
                            Review this {r.kind.toLowerCase()}
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}

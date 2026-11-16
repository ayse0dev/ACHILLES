"use client";

import Link from "next/link";
import { useActionState } from "react";
import { lookupRepairs, TrackState } from "./actions";

const initial: TrackState = {};

const statusStyle: Record<string, string> = {
    Pending: "bg-yellow/30 text-ink",
    "In progress": "bg-teal/25 text-ink",
    Ready: "bg-purple/20 text-ink",
    Completed: "bg-orange/25 text-ink",
};

export default function TrackPage() {
    const [state, formAction, isPending] = useActionState(lookupRepairs, initial);

    return (
        <div className="max-w-md mx-auto px-4 py-10 space-y-6">
            <div>
                <p className="eyebrow mb-2">Repair tracker</p>
                <h1 className="page-title">Where is my shoe?</h1>
                <p className="text-ink/70 mt-2">Enter the email you used when you requested the repair.</p>
            </div>

            <form action={formAction} className="card p-6 space-y-3">
                <input name="email" type="email" placeholder="Email" required className="field" />
                {state.error && <p className="text-red text-sm">{state.error}</p>}
                <button disabled={isPending} className="btn btn-accent w-full">
                    {isPending ? "Searching..." : "Check status"}
                </button>
            </form>

            {state.searched && state.results?.length === 0 && (
                <p className="text-center text-ink/70">
                    No repairs found for that email yet. <Link href="/repair" className="underline">Request one</Link>.
                </p>
            )}

            {state.results && state.results.length > 0 && (
                <ul className="space-y-3">
                    {state.results.map((r, i) => (
                        <li key={i} className="card p-5 flex items-center justify-between gap-4">
                            <div>
                                <p className="font-display font-bold text-lg">{r.shoe}</p>
                                <p className="text-xs text-ink/60">Submitted {r.submitted}</p>
                            </div>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusStyle[r.status] ?? "bg-ink/10"}`}>
                                {r.status}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

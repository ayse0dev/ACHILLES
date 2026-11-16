"use client";

import Link from "next/link";
import { useActionState } from "react";
import { submitRepair, RepairState } from "./actions";

const initial: RepairState = {};

const services = [
    { name: "Sole replacement", note: "Worn-out soles rebuilt or swapped" },
    { name: "Heel repair", note: "Re-build and re-glue worn heels" },
    { name: "Stitching & seams", note: "Loose threads, split seams, torn linings" },
    { name: "Zipper & buckle", note: "Replace zippers, straps and buckles" },
    { name: "Cleaning & restoration", note: "Deep clean, whitening and polish" },
    { name: "Stretching", note: "Make a tight pair comfortable again" },
];

export default function RepairPage() {
    const [state, formAction, isPending] = useActionState(submitRepair, initial);

    return (
        <div className="max-w-5xl mx-auto px-4 py-10 space-y-14">
            <section>
                <p className="eyebrow mb-2">Repair services</p>
                <h1 className="page-title mb-6">Give your shoes a second life</h1>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {services.map((s, i) => (
                        <div
                            key={s.name}
                            className="card p-5 border-t-4"
                            style={{ borderColor: ["#19b3c4", "#8b3fc7", "#ff7a3d", "#ffc83d", "#e8374f", "#19b3c4"][i] }}
                        >
                            <h2 className="font-display font-bold text-xl">{s.name}</h2>
                            <p className="text-sm text-ink/70 mt-1">{s.note}</p>
                            <p className="text-xs mt-3 font-bold text-purple">Quote after inspection</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="max-w-md mx-auto w-full">
                {state.success ? (
                    <div className="card p-8 text-center space-y-4">
                        <p className="eyebrow">All set</p>
                        <h2 className="page-title !text-3xl">Request received!</h2>
                        <p className="text-ink/70">We&apos;ll email you within 24 hours with a quote.</p>
                        <Link href="/track" className="btn btn-ghost">Track your repair</Link>
                    </div>
                ) : (
                    <div className="card p-6 md:p-8 space-y-5">
                        <div>
                            <p className="eyebrow mb-1">Start here</p>
                            <h2 className="page-title !text-3xl">Request a repair</h2>
                        </div>
                        <form action={formAction} className="space-y-3">
                            <input name="name" placeholder="Your name" required className="field" />
                            <input name="email" type="email" placeholder="Email" required className="field" />
                            <input name="phone" placeholder="Phone (optional)" className="field" />
                            <input name="shoeDescription" placeholder="Shoe brand / model" required className="field" />
                            <textarea name="issue" placeholder="Describe the damage" required rows={4} className="field" />
                            <input name="photoUrl" type="url" placeholder="Photo URL (optional)" className="field" />
                            {state.error && <p className="text-red text-sm">{state.error}</p>}
                            <button disabled={isPending} className="btn btn-accent w-full">
                                {isPending ? "Submitting..." : "Submit request"}
                            </button>
                        </form>
                    </div>
                )}
            </section>
        </div>
    );
}

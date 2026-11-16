"use client";

import Honeypot from "@/components/Honeypot";
import Link from "next/link";
import { useActionState } from "react";
import { submitRepair, RepairState } from "./actions";
import BeforeAfter from "@/components/BeforeAfter";
import { repairGroups, rushNotes, mailInSteps, repairPolicies } from "@/lib/business";

const initial: RepairState = {};

const transformations = [
    { label: "Derby", before: "/before-after/derby-before.jpg", after: "/before-after/derby-after.jpg" },
    { label: "Loafer", before: "/before-after/loafer-before.jpg", after: "/before-after/loafer-after.jpg" },
    { label: "Sneaker", before: "/before-after/sneaker-before.jpg", after: "/before-after/sneaker-after.jpg" },
    { label: "Sandal", before: "/before-after/sandal-before.jpg", after: "/before-after/sandal-after.jpg" },
];

export default function RepairPage() {
    const [state, formAction, isPending] = useActionState(submitRepair, initial);

    return (
        <div className="max-w-5xl mx-auto px-4 py-10 space-y-16">
            <section className="space-y-6">
                <div>
                    <p className="eyebrow mb-2">Repairs</p>
                    <h1 className="page-title">Worn out. Brought back.</h1>
                    <p className="text-ink/75 mt-3 max-w-2xl">
                        From worn heels to full restorations, ACHILLES brings your footwear back to life. Free estimate on drop-off. Mail-in accepted nationwide.
                    </p>
                </div>
                <BeforeAfter pairs={transformations} />
                <div className="flex flex-wrap gap-3">
                    <a href="#request" className="btn btn-accent uppercase text-sm tracking-wide">Request a repair quote</a>
                    <Link href="/book" className="btn btn-ghost uppercase text-sm tracking-wide">Book a drop-off</Link>
                </div>
            </section>

            <section className="space-y-8">
                <div>
                    <p className="eyebrow mb-2">Price list</p>
                    <h2 className="page-title !text-3xl">Services and turnaround</h2>
                </div>
                {repairGroups.map((group) => (
                    <div key={group.title} className="card overflow-x-auto">
                        <h3 className="font-black uppercase tracking-tight text-lg px-5 pt-5">{group.title}</h3>
                        <table className="w-full text-left text-sm mt-3">
                            <thead className="bg-ink text-white">
                                <tr>
                                    <th className="px-5 py-3">Service</th>
                                    <th className="px-5 py-3">Price</th>
                                    <th className="px-5 py-3">Turnaround</th>
                                </tr>
                            </thead>
                            <tbody>
                                {group.rows.map((row, i) => (
                                    <tr key={row.service} className={i % 2 ? "bg-purple/5" : ""}>
                                        <td className="px-5 py-3 font-bold">{row.service}</td>
                                        <td className="px-5 py-3 text-purple font-bold whitespace-nowrap">{row.price}</td>
                                        <td className="px-5 py-3 text-ink/70">{row.turnaround}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </section>

            <section className="grid md:grid-cols-2 gap-6">
                <div className="card p-6 border-t-4 border-orange space-y-3">
                    <h2 className="font-black uppercase text-xl">Rush service</h2>
                    <ul className="space-y-2 text-sm text-ink/80 list-disc pl-5">
                        {rushNotes.map((n) => (
                            <li key={n}>{n}</li>
                        ))}
                    </ul>
                </div>
                <div className="card p-6 border-t-4 border-teal space-y-3">
                    <h2 className="font-black uppercase text-xl">Mail-in repair</h2>
                    <ol className="space-y-2 text-sm text-ink/80 list-decimal pl-5">
                        {mailInSteps.map((s) => (
                            <li key={s}>{s}</li>
                        ))}
                    </ol>
                    <p className="text-xs text-ink/60">Adds about 2–4 days each way.</p>
                </div>
            </section>

            <section className="card p-6 md:p-8 space-y-3">
                <h2 className="font-black uppercase text-xl">Repair policies</h2>
                <ul className="space-y-2 text-sm text-ink/80 list-disc pl-5">
                    {repairPolicies.map((p) => (
                        <li key={p}>{p}</li>
                    ))}
                </ul>
            </section>

            <section id="request" className="max-w-md mx-auto w-full scroll-mt-28">
                {state.success ? (
                    <div className="card p-8 text-center space-y-4">
                        <p className="eyebrow">All set</p>
                        <h2 className="page-title !text-3xl">Request received!</h2>
                        <p className="text-ink/70">We&apos;ll email you within 24 hours with a quote.</p>
                        {state.reference && (
                            <p className="font-black text-2xl tracking-widest">{state.reference}</p>
                        )}
                        <p className="text-xs text-ink/60">Keep this reference number to track your repair.</p>
                        <Link href="/track" className="btn btn-ghost">Track your repair</Link>
                    </div>
                ) : (
                    <div className="card p-6 md:p-8 space-y-5">
                        <div>
                            <p className="eyebrow mb-1">Start here</p>
                            <h2 className="page-title !text-3xl">Request a repair quote</h2>
                        </div>
                        <form action={formAction} className="space-y-3">
<Honeypot />
                            <input name="name" placeholder="Your name" required className="field" />
                            <input name="email" type="email" placeholder="Email" required className="field" />
                            <input name="phone" placeholder="Phone (optional)" className="field" />
                            <input name="shoeDescription" placeholder="Shoe brand / model" required className="field" />
                            <textarea name="issue" placeholder="Describe the damage" required rows={4} className="field" />
                            <input name="photoUrl" type="url" placeholder="Photo URL (optional)" className="field" />
                            {state.error && <p className="text-red text-sm">{state.error}</p>}
                            <label className="flex items-start gap-2 text-xs text-ink/70">
<input type="checkbox" name="consent" required className="mt-0.5" />
<span>I agree to the <a href="/privacy" target="_blank" className="underline">Privacy Policy</a> and consent to ACHILLES processing my details.</span>
</label>
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

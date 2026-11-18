import Link from "next/link";
import BeforeAfter from "@/components/BeforeAfter";
import { repairKeyFor } from "@/lib/artSvg";
import { repairGroups, serviceDetails, rushNotes, mailInSteps, repairPolicies } from "@/lib/business";

const transformations = [
    { label: "Derby", before: "/before-after/derby-before.jpg", after: "/before-after/derby-after.jpg" },
    { label: "Loafer", before: "/before-after/loafer-before.jpg", after: "/before-after/loafer-after.jpg" },
    { label: "Sneaker", before: "/before-after/sneaker-before.jpg", after: "/before-after/sneaker-after.jpg" },
    { label: "Sandal", before: "/before-after/sandal-before.jpg", after: "/before-after/sandal-after.jpg" },
];

export default function RepairPage() {
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
                    <Link href="/book" className="btn btn-accent uppercase text-sm tracking-wide">Request a repair quote</Link>
                    <Link href="/book" className="btn btn-ghost uppercase text-sm tracking-wide">Book a drop-off</Link>
                </div>
            </section>

            <section className="space-y-8">
                <div>
                    <p className="eyebrow mb-2">Price list</p>
                    <h2 className="page-title !text-3xl">Services and turnaround</h2>
                </div>
                {repairGroups.map((group) => (
                    <div key={group.title} className="space-y-4">
                        <h3 className="font-black uppercase tracking-tight text-xl">{group.title}</h3>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {group.rows.map((row) => (
                                <article key={row.service} className="card overflow-hidden flex flex-col">
                                    <img
                                        src={`/api/art/repair?key=${repairKeyFor(row.service)}`}
                                        alt={row.service}
                                        loading="lazy"
                                        className="w-full aspect-[4/3] object-cover border-b-2 border-ink"
                                    />
                                    <div className="p-5 flex flex-col gap-3 flex-1">
                                        <h4 className="font-display font-bold text-lg leading-snug">{row.service}</h4>
                                        <div className="flex flex-wrap items-center gap-2 mt-auto">
                                            <span className="bg-purple/10 text-purple font-bold text-sm rounded-full px-3 py-1">{row.price}</span>
                                            <span className="bg-teal/15 text-ink/80 text-xs font-bold rounded-full px-3 py-1">{row.turnaround}</span>
                                        </div>
                                        <p className="text-sm text-ink/75 leading-relaxed">{serviceDetails[row.service]}</p>
                                        <Link href={`/book?service=${encodeURIComponent(row.service)}`} aria-label={`Request ${row.service}`} className="btn btn-accent !py-2 text-xs uppercase w-full text-center">
                                            Request this service
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>
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

            <section className="rounded-3xl bg-ink text-white p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Ready when you are</p>
                    <h2 className="text-2xl md:text-3xl font-black mt-1">Book your repair in a few clicks</h2>
                    <p className="text-white/70 text-sm mt-2">Pick your services, see an estimate, and choose drop-off, mail-in or an appointment.</p>
                </div>
                <Link href="/book" className="rounded-full bg-white text-ink font-black uppercase tracking-wider text-sm px-8 py-4 text-center">Mag-book ng serbisyo</Link>
            </section>
        </div>
    );
}

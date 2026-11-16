import { repairPolicies, shoppingPolicies } from "@/lib/business";

export const metadata = {
    title: "Policies – ACHILLES",
    description: "Repair policies, shopping policies, warranty, shipping and returns.",
};

export default function PoliciesPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-12 space-y-12">
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple mb-2">Good to know</p>
                <h1 className="uppercase font-black text-4xl md:text-5xl tracking-tight">Policies</h1>
            </div>

            <section id="repair" className="card p-6 md:p-8 space-y-3 scroll-mt-28">
                <h2 className="font-black uppercase text-xl">Repair policies &amp; warranty</h2>
                <ul className="space-y-2 text-sm text-ink/80 list-disc pl-5">
                    {repairPolicies.map((p) => (
                        <li key={p}>{p}</li>
                    ))}
                </ul>
            </section>

            <section id="shopping" className="card p-6 md:p-8 space-y-4 scroll-mt-28">
                <h2 className="font-black uppercase text-xl">Shopping, shipping &amp; returns</h2>
                <dl className="space-y-3 text-sm">
                    {shoppingPolicies.map((p) => (
                        <div key={p.title} className="grid sm:grid-cols-[10rem_1fr] gap-1">
                            <dt className="font-bold">{p.title}</dt>
                            <dd className="text-ink/80">{p.text}</dd>
                        </div>
                    ))}
                </dl>
            </section>
        </div>
    );
}

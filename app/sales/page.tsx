import Link from "next/link";
import { offers, promoTerms, whyBuy } from "@/lib/business";
import { getSaleProducts } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

export const metadata = {
    title: "Sales & Offers – ACHILLES",
    description: "Current ACHILLES discounts, bundles and promo terms.",
};

const colors = ["#19b3c4", "#8b3fc7", "#ff7a3d", "#ffc83d", "#e8374f", "#19b3c4", "#8b3fc7", "#ff7a3d"];

export const revalidate = 300;

export default async function SalesPage() {
    const onSale = await getSaleProducts(24);
    return (
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 space-y-14">
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple mb-2">Save more</p>
                <h1 className="uppercase font-black text-4xl md:text-6xl tracking-tight">Sales &amp; offers</h1>
            </div>

            <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {offers.map((o, i) => (
                    <article key={o.offer} className="card p-6 border-t-4" style={{ borderColor: colors[i % colors.length] }}>
                        <h2 className="uppercase font-black text-lg mb-2">{o.offer}</h2>
                        <p className="text-sm text-ink/75">{o.details}</p>
                    </article>
                ))}
            </section>

            {onSale.length > 0 && (
                <section className="space-y-6">
                    <h2 className="uppercase font-black text-2xl tracking-tight">On sale now</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {onSale.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </section>
            )}

            <section className="grid md:grid-cols-2 gap-6">
                <div className="card p-6 md:p-8 space-y-3">
                    <h2 className="font-black uppercase text-xl">Promo terms</h2>
                    <ul className="space-y-2 text-sm text-ink/80 list-disc pl-5">
                        {promoTerms.map((t) => (
                            <li key={t}>{t}</li>
                        ))}
                    </ul>
                </div>
                <div className="card p-6 md:p-8 space-y-3">
                    <h2 className="font-black uppercase text-xl">Why buy at ACHILLES</h2>
                    <ul className="space-y-2 text-sm text-ink/80 list-disc pl-5">
                        {whyBuy.map((t) => (
                            <li key={t}>{t}</li>
                        ))}
                    </ul>
                </div>
            </section>

            <div className="text-center">
                <Link href="/shop" className="btn btn-accent uppercase text-sm tracking-wide">Shop shoes</Link>
            </div>
        </div>
    );
}

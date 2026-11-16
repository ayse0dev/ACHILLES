import Link from "next/link";
import { getFeaturedProducts } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

export default async function HomePage() {
    const products = await getFeaturedProducts(8);
    const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean) as string[])).slice(0, 4);

    return (
        <div>
            <section className="abstract-hero relative min-h-[80vh] flex items-center justify-center px-6 py-24 text-center">
                <span className="blob w-96 h-96 -top-24 -left-16 bg-teal" />
                <span className="blob w-80 h-80 -bottom-28 right-0 bg-orange" />
                <span className="blob w-52 h-52 top-12 right-1/4 bg-purple opacity-60" />
                <span className="ring w-64 h-64 bottom-10 left-1/3" />

                <div className="max-w-4xl space-y-6">
                    <p className="eyebrow">Footwear &amp; repair</p>
                    <h1 className="uppercase font-black tracking-tight text-5xl md:text-8xl leading-[0.9] text-ink">
                        New shoes.<br />
                        <span className="text-purple">Fresh soles.</span>
                    </h1>
                    <p className="text-lg md:text-xl max-w-xl mx-auto text-ink/80">
                        Find your next pair, or bring your favorites back to life.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center pt-2">
                        <Link href="/shop" className="btn btn-ink !px-8 !py-4 uppercase text-sm tracking-wide">
                            Shop new arrivals
                        </Link>
                        <Link href="/repair" className="btn btn-ghost !px-8 !py-4 uppercase text-sm tracking-wide">
                            Book a repair
                        </Link>
                    </div>
                </div>
            </section>

            {categories.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 md:px-6 py-16">
                    <h2 className="uppercase font-black text-2xl tracking-tight mb-6">Shop by category</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {categories.map((c, i) => (
                            <Link
                                key={c}
                                href={`/shop?category=${encodeURIComponent(c)}`}
                                className="group relative aspect-[4/5] rounded-3xl overflow-hidden flex items-end p-5 text-white"
                                style={{
                                    background: [
                                        "linear-gradient(160deg,#19b3c4,#1b1340)",
                                        "linear-gradient(160deg,#8b3fc7,#1b1340)",
                                        "linear-gradient(160deg,#ff7a3d,#8b3fc7)",
                                        "linear-gradient(160deg,#ffc83d,#e8374f)",
                                    ][i % 4],
                                }}
                            >
                                <span className="uppercase font-black text-xl tracking-tight group-hover:underline">{c}</span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            <section className="max-w-7xl mx-auto px-4 md:px-6 pb-16">
                <div className="flex items-end justify-between mb-6">
                    <h2 className="uppercase font-black text-2xl tracking-tight">Featured</h2>
                    <Link href="/shop" className="text-sm font-bold uppercase underline">
                        Shop all
                    </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {products.map((p) => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 md:px-6 pb-16 grid md:grid-cols-2 gap-6">
                <div className="bg-ink text-white rounded-3xl p-10 md:p-14 space-y-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow">Repairs</p>
                    <h3 className="uppercase font-black text-3xl md:text-4xl tracking-tight leading-tight">
                        Worn soles? We rebuild them.
                    </h3>
                    <p className="text-white/75">Soles, heels, stitching, zippers and cleaning. Get a quote within 24 hours.</p>
                    <Link href="/repair" className="inline-block btn btn-accent !py-3 !px-6 uppercase text-xs tracking-wide">
                        Request a repair
                    </Link>
                </div>
                <div className="bg-gradient-to-br from-teal to-purple text-white rounded-3xl p-10 md:p-14 space-y-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow">Already dropped one off?</p>
                    <h3 className="uppercase font-black text-3xl md:text-4xl tracking-tight leading-tight">
                        Track your repair
                    </h3>
                    <p className="text-white/85">Check the status with the email you used when you requested it.</p>
                    <Link href="/track" className="inline-block btn btn-ink !py-3 !px-6 uppercase text-xs tracking-wide">
                        Check status
                    </Link>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 md:px-6 pb-24 text-center space-y-4">
                <h2 className="uppercase font-black text-3xl tracking-tight">Take Achilles with you</h2>
                <p className="text-ink/70">Shop faster and track repairs on the go.</p>
                <Link href="/download" className="btn btn-ink uppercase text-sm tracking-wide">
                    Get the app
                </Link>
            </section>
        </div>
    );
}

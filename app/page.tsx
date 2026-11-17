import Link from "next/link";
import { getFeaturedProducts } from "@/lib/products";
import { base } from "@/lib/airtable";
import ProductCard from "@/components/ProductCard";
import HomeTabs from "@/components/HomeTabs";
import CardDeck from "@/components/CardDeck";
import { DoodleField } from "@/components/Doodles";
import { contact, trustPoints, shopCategories } from "@/lib/business";

export const dynamic = "force-dynamic";

const features = [
    { href: "/shop", title: "Shoes", text: "Browse and filter the collection." },
    { href: "/repair", title: "Repairs", text: "Soles, heels, stitching and more." },
    { href: "/book", title: "Book a drop-off", text: "Choose a time that suits you." },
    { href: "/track", title: "Track", text: "Follow a repair, order or ticket with its reference number." },
    { href: "/wishlist", title: "Wishlist", text: "Save the pairs you want next." },
    { href: "/reviews", title: "Reviews", text: "Read what customers say about their repairs." },
];

export default async function HomePage() {
    const products = await getFeaturedProducts(12);
    const [hero, ...rest] = products;
    const grid = rest.slice(0, 8);

    const tabs = [
        {
            key: "shoppers",
            label: "Shoppers",
            title: "Find the pair you'll wear every day",
            points: ["Filter by category and sort by price", "Choose your size with the sizing guide", "Save favorites and check out securely"],
            href: "/shop",
            cta: "Shop now",
            image: "/hero/sandal-new.png",
            artName: products[0]?.name ?? "Shoppers",
        },
        {
            key: "repairs",
            label: "Repairs",
            title: "Give your favorite shoes a second life",
            points: ["Request a repair with photos", "Get a quote within 24 hours", "Track progress without calling"],
            href: "/repair",
            cta: "Request a repair",
            image: "/hero/sandal-worn.png",
            artName: products[1]?.name ?? "Repairs",
        },
        {
            key: "care",
            label: "Care",
            title: "Keep every pair looking new",
            points: ["Simple cleaning and storage tips", "Know when a repair is worth it", "Book a consultation with our team"],
            href: "/care",
            cta: "Read the care guide",
            image: "/hero/shoe.png",
            artName: products[2]?.name ?? "Care",
        },
    ];

    const reviewRecords = await base("Reviews")
        .select({ filterByFormula: "{Approved}", sort: [{ field: "CreatedAt", direction: "desc" }], maxRecords: 3 })
        .firstPage()
        .catch(() => []);
    const reviews = reviewRecords.map((r) => {
        const f = r.fields as { Name?: string; Rating?: number; Comment?: string };
        return { id: r.id, name: f.Name ?? "Customer", rating: Math.min(5, Math.max(1, Math.round(f.Rating ?? 5))), comment: f.Comment ?? "" };
    });

    return (
        <div>
            <section className="max-w-7xl mx-auto px-4 md:px-6 pt-14 pb-20 grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-7">
                    <p className="eyebrow">Footwear &amp; repair</p>
                    <h1 className="uppercase font-black tracking-tight text-5xl md:text-6xl leading-[0.95] text-ink">
                        Repair. Restore.<br />
                        <span className="text-purple">Retail.</span>
                    </h1>
                    <p className="text-lg text-ink/75 max-w-lg">
                        Quality shoe repair and footwear for the whole family: men, women, and kids.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Link href="/book" className="btn btn-ink !px-7 !py-4 uppercase text-sm tracking-wide">
                            Book a repair
                        </Link>
                        <Link href="/shop" className="btn btn-ghost !px-7 !py-4 uppercase text-sm tracking-wide">
                            Shop shoes
                        </Link>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4 pt-6 border-t border-ink/10 text-sm">
                        <div>
                            <p className="font-black uppercase text-xs text-ink/60">Shop</p>
                            <p>{contact.address}</p>
                        </div>
                        <div>
                            <p className="font-black uppercase text-xs text-ink/60">Hours</p>
                            <p>{contact.hours}</p>
                        </div>
                        <div>
                            <p className="font-black uppercase text-xs text-ink/60">Shipping</p>
                            <p>Nationwide shipping</p>
                        </div>
                    </div>
                </div>

                <div className="abstract-hero relative rounded-[2rem] aspect-[4/5] md:aspect-square p-6 md:p-10 flex items-center justify-center">
                    <span className="blob w-72 h-72 -top-10 -left-10 bg-teal" />
                    <span className="blob w-60 h-60 -bottom-10 -right-6 bg-orange" />
                    <DoodleField />
                    <img
                        src="/hero/shoe.png"
                        alt="ACHILLES featured shoe"
                        className="relative w-full max-w-md drop-shadow-[0_30px_40px_rgba(27,19,64,0.35)] -rotate-6 hover:rotate-0 transition duration-700"
                    />
                </div>
            </section>

            <section className="border-y border-ink/10 bg-white">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {trustPoints.map((t) => (
                        <div key={t.title}>
                            <p className="font-black uppercase text-sm">{t.title}</p>
                            <p className="text-sm text-ink/70">{t.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 md:px-6 pt-16">
                <h2 className="uppercase font-black text-2xl tracking-tight mb-6">Shop by category</h2>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    {shopCategories.map((c, i) => (
                        <Link
                            key={c.label}
                            href={c.href}
                            className="group relative aspect-[4/5] rounded-3xl overflow-hidden flex flex-col justify-end p-5 text-white"
                            style={{
                                background: [
                                    "linear-gradient(160deg,#19b3c4,#1b1340)",
                                    "linear-gradient(160deg,#8b3fc7,#1b1340)",
                                    "linear-gradient(160deg,#ff7a3d,#8b3fc7)",
                                    "linear-gradient(160deg,#ffc83d,#e8374f)",
                                    "linear-gradient(160deg,#e8374f,#1b1340)",
                                ][i % 5],
                            }}
                        >
                            <span className="uppercase font-black text-xl tracking-tight group-hover:underline">{c.label}</span>
                            <span className="text-xs text-white/85">{c.text}</span>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 md:px-6 py-20">
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <p className="eyebrow mb-2">Fresh picks</p>
                        <h2 className="uppercase font-black text-3xl md:text-4xl tracking-tight">Featured shoes</h2>
                    </div>
                    <Link href="/shop" className="text-sm font-bold uppercase underline">Shop all</Link>
                </div>
                {grid.length === 0 ? (
                    <p className="text-ink/60">New shoes are on the way.</p>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10">
                        {grid.map((p) => (
                            <ProductCard key={p.id} product={p} showPrice={false} />
                        ))}
                    </div>
                )}
            </section>

            <section className="relative overflow-hidden bg-ink text-white">
                <DoodleField tone="dark" />
                <span className="pointer-events-none absolute -top-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-teal/40 blur-3xl animate-drift" />
                <span className="pointer-events-none absolute top-1/3 -right-24 w-[26rem] h-[26rem] rounded-full bg-purple/50 blur-3xl animate-drift-slow" />
                <span className="pointer-events-none absolute -bottom-32 left-1/3 w-[24rem] h-[24rem] rounded-full bg-orange/35 blur-3xl animate-drift" />
                <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-20 space-y-10">
                    <div className="max-w-2xl space-y-3">
                        <p className="eyebrow !text-yellow">Built for every need</p>
                        <h2 className="uppercase font-black text-3xl md:text-5xl tracking-tight">
                            <span className="gradient-text-bright">Shopping, repairs</span> and care
                        </h2>
                    </div>
                    <HomeTabs tabs={tabs} dark />
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 md:px-6 py-20">
                <p className="eyebrow mb-3">Everything in one place</p>
                <h2 className="uppercase font-black text-3xl md:text-5xl tracking-tight mb-10">Your shoes, your way</h2>
                <CardDeck items={features} />
            </section>

            <section className="max-w-7xl mx-auto px-4 md:px-6 pb-20">
                <p className="eyebrow mb-2">Reviews</p>
                <h2 className="uppercase font-black text-3xl md:text-4xl tracking-tight mb-8">From our customers</h2>
                {reviews.length === 0 ? (
                    <p className="text-ink/70">
                        Reviews will show here once they&apos;re approved. <Link href="/reviews" className="underline font-bold">Leave one</Link>.
                    </p>
                ) : (
                    <div className="grid md:grid-cols-3 gap-6">
                        {reviews.map((r) => (
                            <article key={r.id} className="card p-7 space-y-4">
                                <p className="text-purple font-black">
                                    {"★".repeat(r.rating)}
                                    {"☆".repeat(5 - r.rating)}
                                </p>
                                <p className="text-ink/85">{r.comment}</p>
                                <p className="text-xs font-bold uppercase text-ink/50">{r.name}</p>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            <section className="max-w-7xl mx-auto px-4 md:px-6 pb-24">
                <div className="bg-gradient-to-br from-teal via-purple to-orange text-white rounded-[2rem] p-10 md:p-16 text-center space-y-6">
                    <h2 className="uppercase font-black text-3xl md:text-5xl tracking-tight">Take ACHILLES with you</h2>
                    <p className="text-white/90 max-w-xl mx-auto">Shop faster and track repairs on the go.</p>
                    <Link href="/download" className="btn btn-ink uppercase text-sm tracking-wide">Get the app</Link>
                </div>
            </section>
        </div>
    );
}

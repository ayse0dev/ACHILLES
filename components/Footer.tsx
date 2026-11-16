import Link from "next/link";

const columns = [
    {
        title: "Shop",
        links: [
            { href: "/shop", label: "All shoes" },
            { href: "/cart", label: "Your bag" },
            { href: "/orders", label: "Your orders" },
            { href: "/wishlist", label: "Wishlist" },
        ],
    },
    {
        title: "Repair",
        links: [
            { href: "/repair", label: "Request a repair" },
            { href: "/book", label: "Book a drop-off" },
            { href: "/track", label: "Track a repair" },
            { href: "/reviews", label: "Reviews" },
        ],
    },
    {
        title: "Help",
        links: [
            { href: "/sizing", label: "Sizing guide" },
            { href: "/care", label: "Care guide" },
            { href: "/about", label: "About ACHILLES" },
            { href: "/download", label: "Get the app" },
        ],
    },
];

export default function Footer() {
    return (
        <footer className="bg-ink text-white mt-24">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-16 grid gap-12 md:grid-cols-4">
                <div className="space-y-4">
                    <p className="font-black text-3xl tracking-tight uppercase">
                        <img src="/logo.png" alt="ACHILLES" className="h-20 w-auto" />
                    </p>
                    <p className="text-sm text-white/70 max-w-xs">
                        Shoes you love, and repairs that bring them back.
                    </p>
                </div>
                {columns.map((c) => (
                    <div key={c.title}>
                        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-yellow mb-4">{c.title}</h2>
                        <ul className="space-y-3 text-sm">
                            {c.links.map((l) => (
                                <li key={l.href}>
                                    <Link href={l.href} className="hover:text-yellow transition">
                                        {l.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
            <div className="border-t border-white/15">
                <p className="max-w-7xl mx-auto px-4 md:px-6 py-6 text-xs text-white/60">
                    © {new Date().getFullYear()} ACHILLES. All rights reserved.
                </p>
            </div>
        </footer>
    );
}

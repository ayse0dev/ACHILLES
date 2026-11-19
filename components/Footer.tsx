import Link from "next/link";
import { contact } from "@/lib/business";

const columns = [
    {
        title: "Shop",
        links: [
            { href: "/shop", label: "All shoes" },
            { href: "/shop?category=Men", label: "Men" },
            { href: "/shop?category=Women", label: "Women" },
            { href: "/shop?category=Kids", label: "Kids" },
            { href: "/shop?category=Sports", label: "Sports" },
            { href: "/sales", label: "Sales & Offers" },
        ],
    },
    {
        title: "Repairs",
        links: [
            { href: "/repair", label: "Repair services" },
            { href: "/book", label: "Book a drop-off" },
            { href: "/track", label: "Track a repair" },
            { href: "/reviews", label: "Reviews" },
            { href: "/care", label: "Care guide" },
        ],
    },
    {
        title: "Help",
        links: [
            { href: "/contact", label: "Contact" },
            { href: "/support", label: "Support" },
            { href: "/policies#repair", label: "Repair policies & warranty" },
            { href: "/policies#shopping", label: "Shipping & returns" },
            { href: "/privacy", label: "Privacy policy" },
            { href: "/sizing", label: "Sizing guide" },
            { href: "/about", label: "About" },
            { href: "/download", label: "Get the app" },
        ],
    },
];

export default function Footer() {
    return (
        <footer className="bg-ink text-white mt-24">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-16 grid gap-12 md:grid-cols-4">
                <div className="space-y-4">
                    <img src="/logo-white.png" alt="ACHILLES" className="h-20 w-auto" />
                    <p className="text-sm text-white/70 max-w-xs">Repair. Restore. Retail.</p>
                    <p className="text-xs text-white/60">{contact.address}</p>
                    <p className="text-xs text-white/60">{contact.hours}</p>
                    {contact.phone && <p className="text-xs text-white/60">{contact.phone}</p>}
                    <p className="flex gap-4 text-xs font-bold">
                        {contact.facebook && <a href={contact.facebook} target="_blank" rel="noopener noreferrer" className="underline">Facebook</a>}
                        {contact.instagram && <a href={contact.instagram} target="_blank" rel="noopener noreferrer" className="underline">Instagram</a>}
                        {contact.tiktok && <a href={contact.tiktok} target="_blank" rel="noopener noreferrer" className="underline">TikTok</a>}
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
                    © ACHILLES {new Date().getFullYear()}. All rights reserved.
                </p>
            </div>
        </footer>
    );
}

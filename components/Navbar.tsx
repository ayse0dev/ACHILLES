"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useCart } from "./CartProvider";

const links = [
    { href: "/repair", label: "Repairs" },
    { href: "/shop", label: "Shop" },
    { href: "/shop?category=Men", label: "Men" },
    { href: "/shop?category=Women", label: "Women" },
    { href: "/shop?category=Kids", label: "Kids" },
    { href: "/shop?category=Sports", label: "Sports" },
    { href: "/sales", label: "Sales & Offers" },
    { href: "/track", label: "Track" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/download", label: "Get App" },
];

const hiddenInShop = ["/repair", "/shop", "/track", "/about", "/contact", "/download"];
const shopOnly = ["/shop?category=Men", "/shop?category=Women", "/shop?category=Kids", "/shop?category=Sports", "/sales"];

export default function Navbar() {
    const { data: session, status } = useSession();
    const { count } = useCart();
    const pathname = usePathname();
    const visibleLinks = pathname.startsWith("/shop")
        ? [{ href: "/", label: "Home" }, ...links.filter((l) => !hiddenInShop.includes(l.href))]
        : links.filter((l) => !shopOnly.includes(l.href));

    return (
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-ink/10">
            <nav className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
                <Link href="/" className="shrink-0" aria-label="ACHILLES home">
                    <img src="/logo.png" alt="ACHILLES" className="h-12 w-auto" />
                </Link>

                <ul className="hidden xl:flex items-center gap-5">
                    {visibleLinks.map((l) => (
                        <li key={l.href}>
                            <Link
                                href={l.href}
                                className="text-xs font-bold uppercase tracking-wide whitespace-nowrap hover:text-purple transition"
                            >
                                {l.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="flex items-center gap-4 text-sm shrink-0">
                    {status !== "loading" &&
                        (session?.user ? (
                            <>
                                <span className="hidden 2xl:inline text-ink/70">
                                    {session.user.name ?? session.user.email}
                                </span>
                                <button onClick={() => signOut({ callbackUrl: "/" })} className="underline font-bold">
                                    Log out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="hidden sm:inline underline font-bold">
                                    Log in
                                </Link>
                                <Link href="/register" className="hidden sm:inline-flex btn btn-ink !py-2 !px-4 text-xs uppercase">
                                    Join
                                </Link>
                            </>
                        ))}
                    <Link href="/cart" className="relative btn btn-ghost !py-2 !px-4 text-xs uppercase" aria-label="Cart">
                        Bag
                        {count > 0 && (
                            <span className="ml-1 bg-orange text-white text-[10px] rounded-full min-w-[1.1rem] h-[1.1rem] px-1 flex items-center justify-center">
                                {count}
                            </span>
                        )}
                    </Link>
                </div>
            </nav>

            <div className="xl:hidden overflow-x-auto border-t border-ink/10">
                <ul className="flex gap-5 px-4 py-2 whitespace-nowrap">
                    {visibleLinks.map((l) => (
                        <li key={l.href}>
                            <Link href={l.href} className="text-xs font-bold uppercase tracking-wide">
                                {l.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </header>
    );
}

"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useCart } from "./CartProvider";
import NotificationBell from "./NotificationBell";
import AccountMenu from "./AccountMenu";
import { BagIcon } from "./NavIcons";

const links = [
    { href: "/repair", label: "Repairs" },
    { href: "/shop", label: "Shop" },
    { href: "/shop?category=Men", label: "Men" },
    { href: "/shop?category=Women", label: "Women" },
    { href: "/shop?category=Kids", label: "Kids" },
    { href: "/shop?category=Sports", label: "Sports" },
    { href: "/shop?category=Cleaning", label: "Cleaning Equipment" },
    { href: "/sales", label: "Sales & Offers" },
    { href: "/track", label: "Track" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/support", label: "Support" },
    { href: "/download", label: "Get App" },
];

const hiddenInShop = ["/repair", "/shop", "/track", "/about", "/contact", "/support", "/download"];
const shopOnly = ["/shop?category=Men", "/shop?category=Women", "/shop?category=Kids", "/shop?category=Sports", "/shop?category=Cleaning", "/sales"];

export default function Navbar() {
    const { data: session, status } = useSession();
    const { count } = useCart();
    const pathname = usePathname();
    const role = String((session?.user as { role?: string } | undefined)?.role ?? "").toLowerCase();
    const dashboard = role === "admin" ? { href: "/admin", label: "Admin" } : role === "staff" ? { href: "/staff", label: "Staff" } : null;
    const baseLinks = pathname.startsWith("/shop")
        ? [{ href: "/", label: "Home" }, ...links.filter((l) => !hiddenInShop.includes(l.href))]
        : links.filter((l) => !shopOnly.includes(l.href));
    const isAdminUser = role === "admin" || role === "staff";
    const visibleLinks = isAdminUser ? [] : dashboard ? [...baseLinks, dashboard] : baseLinks;

    return (
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-ink/10">
            <nav className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
                <Link href={dashboard ? dashboard.href : "/"} className="shrink-0" aria-label="ACHILLES home">
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

                <div className="flex items-center gap-3 text-sm shrink-0">
                    {status !== "loading" && session?.user && !isAdminUser && <NotificationBell />}
                    {!isAdminUser && (
                        <Link
                            href="/cart"
                            className="relative w-10 h-10 rounded-full border-2 border-ink flex items-center justify-center hover:bg-ink/5"
                            aria-label="Cart"
                        >
                            <BagIcon />
                            {count > 0 && (
                                <span className="absolute -top-1 -right-1 bg-orange text-white text-[10px] rounded-full min-w-[1.1rem] h-[1.1rem] px-1 flex items-center justify-center">
                                    {count}
                                </span>
                            )}
                        </Link>
                    )}
                    {status !== "loading" &&
                        (session?.user ? (
                            <AccountMenu
                                userId={(session.user as { id?: string }).id ?? ""}
                                name={session.user.name ?? ""}
                                email={session.user.email ?? ""}
                                role={role || "customer"}
                            />
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
                </div>
            </nav>

            <div className={`xl:hidden overflow-x-auto border-t border-ink/10 ${visibleLinks.length === 0 ? "hidden" : ""}`}>
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

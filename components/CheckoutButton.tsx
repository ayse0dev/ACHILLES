"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "./CartProvider";

export default function CheckoutButton() {
    const { items } = useCart();
    const [pending, setPending] = useState(false);
    const [error, setError] = useState("");
    const [needsLogin, setNeedsLogin] = useState(false);

    async function checkout() {
        setPending(true);
        setError("");
        setNeedsLogin(false);
        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: items.map((i) => ({ slug: i.slug, size: i.size, qty: i.qty })),
                }),
            });
            const data = await res.json();
            if (res.status === 401) {
                setNeedsLogin(true);
                return;
            }
            if (!res.ok || !data.url) {
                setError(data.error ?? "Checkout failed. Please try again.");
                return;
            }
            window.location.href = data.url;
        } catch {
            setError("Checkout failed. Please try again.");
        } finally {
            setPending(false);
        }
    }

    return (
        <div className="space-y-2">
            {needsLogin ? (
                <Link href="/login?callbackUrl=/cart" className="btn btn-accent">
                    Log in to checkout
                </Link>
            ) : (
                <button onClick={checkout} disabled={pending || items.length === 0} className="btn btn-accent">
                    {pending ? "Redirecting..." : "Checkout"}
                </button>
            )}
            {error && <p className="text-red text-sm">{error}</p>}
        </div>
    );
}

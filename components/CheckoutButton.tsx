"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "./CartProvider";

export default function CheckoutButton() {
    const { items } = useCart();
    const [pending, setPending] = useState(false);
    const [error, setError] = useState("");
    const [needsLogin, setNeedsLogin] = useState(false);
    const [discount, setDiscount] = useState("none");
    const [idNumber, setIdNumber] = useState("");

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
                    discount,
                    idNumber,
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
            <label className="block text-xs font-bold uppercase text-ink/60">Discount</label>
            <select value={discount} onChange={(e) => setDiscount(e.target.value)} className="field !py-2">
                <option value="none">No discount</option>
                <option value="student">Student (20%)</option>
                <option value="senior">Senior citizen (20%)</option>
                <option value="pwd">PWD (20%)</option>
            </select>
            {discount !== "none" && (
                <>
                    <input
                        value={idNumber}
                        onChange={(e) => setIdNumber(e.target.value)}
                        placeholder="ID number"
                        className="field !py-2"
                    />
                    <p className="text-xs text-ink/60">Bring this ID on delivery or pick-up. Orders with an invalid ID may be cancelled or repriced.</p>
                </>
            )}
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

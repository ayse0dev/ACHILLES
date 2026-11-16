"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import CheckoutButton from "@/components/CheckoutButton";

export default function CartPage() {
    const { items, subtotal, setQty, remove, clear } = useCart();

    if (items.length === 0) {
        return (
            <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
                <p className="eyebrow">Your cart</p>
                <h1 className="page-title">Nothing here yet</h1>
                <Link href="/shop" className="btn btn-ink">Browse shoes</Link>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
            <div>
                <p className="eyebrow mb-2">Your cart</p>
                <h1 className="page-title">Ready to go?</h1>
            </div>

            <ul className="space-y-4">
                {items.map((item) => (
                    <li key={`${item.slug}-${item.size}`} className="card p-4 flex gap-4 items-center">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal/25 to-orange/30 overflow-hidden shrink-0">
                            {item.image && (
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <Link href={`/shop/${item.slug}`} className="font-display font-bold text-lg hover:text-purple">
                                {item.name}
                            </Link>
                            <p className="text-sm text-ink/60">Size {item.size} · ${item.price.toFixed(2)}</p>
                            <button
                                onClick={() => remove(item.slug, item.size)}
                                className="text-xs underline text-ink/60 hover:text-red mt-1"
                            >
                                Remove
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                className="chip !py-1 !px-3"
                                onClick={() => setQty(item.slug, item.size, item.qty - 1)}
                                aria-label="Decrease quantity"
                            >
                                −
                            </button>
                            <span className="w-6 text-center font-bold">{item.qty}</span>
                            <button
                                className="chip !py-1 !px-3"
                                onClick={() => setQty(item.slug, item.size, item.qty + 1)}
                                aria-label="Increase quantity"
                            >
                                +
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            <div className="card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <p className="text-sm text-ink/60">Subtotal</p>
                    <p className="text-3xl font-black text-purple">${subtotal.toFixed(2)}</p>
                </div>
                <div className="flex gap-3 items-center">
                    <button onClick={clear} className="btn btn-ghost text-sm">Clear cart</button>
                    <CheckoutButton />
                </div>
            </div>
        </div>
    );
}

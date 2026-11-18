"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";

export default function AddToCart({
    product,
}: {
    product: { slug: string; name: string; price: number; image?: string; sizes: string[]; stock: number };
}) {
    const { add } = useCart();
    const [size, setSize] = useState<string | null>(null);
    const [justAdded, setJustAdded] = useState(false);
    const soldOut = product.stock <= 0;

    function handleAdd() {
        if (!size) return;
        const ok = add({ slug: product.slug, name: product.name, price: product.price, image: product.image, size });
        if (!ok) return;
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 1500);
    }

    return (
        <div className="space-y-5">
            {product.sizes.length > 0 && (
                <div>
                    <p className="text-sm font-bold mb-2">Choose a size</p>
                    <div className="flex flex-wrap gap-2">
                        {product.sizes.map((s) => (
                            <button
                                key={s}
                                type="button"
                                aria-pressed={size === s}
                                onClick={() => setSize(s)}
                                className="chip min-w-[3rem]"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <button
                type="button"
                onClick={handleAdd}
                disabled={soldOut || !size}
                className="btn btn-accent w-full !py-4 text-lg"
            >
                {soldOut ? "Sold out" : justAdded ? "Added to cart!" : size ? "Add to cart" : "Pick a size first"}
            </button>
        </div>
    );
}

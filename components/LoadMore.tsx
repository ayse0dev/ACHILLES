"use client";

import { useState } from "react";
import { Product } from "@/lib/airtable";
import ProductCard from "./ProductCard";

export default function LoadMore({
    initialProducts,
}: {
    initialProducts: Product[];
}) {
    const [products, setProducts] = useState(initialProducts);
    const [offset, setOffset] = useState<string | undefined>();
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    async function loadMore() {
        setLoading(true);
        try {
            const res = await fetch(
                `/api/products?limit=12${offset ? `&offset=${offset}` : ""}`
            );
            const data = await res.json();
            if (!data.products?.length) {
                setDone(true);
            } else {
                setProducts((prev) => [...prev, ...data.products]);
                setOffset(data.nextOffset);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                ))}
            </div>
            <div className="text-center mt-8">
                {!done ? (
                    <button
                        onClick={loadMore}
                        disabled={loading}
                        className="bg-black text-white px-6 py-2 rounded disabled:opacity-50"
                    >
                        {loading ? "Loading..." : "Load more"}
                    </button>
                ) : (
                    <p className="text-gray-500">No more products.</p>
                )}
            </div>
        </>
    );
}
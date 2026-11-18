"use client";

import { priceOf } from "@/lib/price";
import { useMemo, useState } from "react";
import Link from "next/link";
import { productCategories } from "@/lib/categories";
import type { Product } from "@/lib/airtable";
import ProductCard from "./ProductCard";

type SortKey = "featured" | "low" | "high" | "name";

const sortOptions: { key: SortKey; label: string }[] = [
    { key: "featured", label: "Featured" },
    { key: "low", label: "Price: low to high" },
    { key: "high", label: "Price: high to low" },
    { key: "name", label: "Name A–Z" },
];

export default function LoadMore({
    initialProducts,
    initialOffset,
    category,
}: {
    initialProducts: Product[];
    initialOffset?: string;
    category: string;
}) {
    const [products, setProducts] = useState(initialProducts);
    const [offset, setOffset] = useState<string | undefined>(initialOffset);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(!initialOffset);
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState<SortKey>("featured");

    const categories = ["All", ...productCategories];

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        const filtered = products.filter(
            (p) =>
                (!q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
        );
        const sorted = [...filtered];
        if (sort === "low") sorted.sort((a, b) => priceOf(a) - priceOf(b));
        if (sort === "high") sorted.sort((a, b) => priceOf(b) - priceOf(a));
        if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
        return sorted;
    }, [products, query, sort]);

    async function loadMore() {
        if (!offset) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/products?limit=12&offset=${encodeURIComponent(offset)}${category === "All" ? "" : `&category=${encodeURIComponent(category)}`}`);
            const data = await res.json();
            const incoming: Product[] = data.products ?? [];
            if (incoming.length === 0) {
                setDone(true);
                setOffset(undefined);
                return;
            }
            setProducts((prev) => {
                const seen = new Set(prev.map((p) => p.id));
                return [...prev, ...incoming.filter((p) => !seen.has(p.id))];
            });
            setOffset(data.nextOffset);
            if (!data.nextOffset) setDone(true);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className="flex flex-col gap-4 mb-8">
                <div className="flex flex-wrap gap-2">
                    {categories.map((c) => (
                        <Link
                            key={c}
                            href={c === "All" ? "/shop#products" : `/shop?category=${c}#products`}
                            scroll={false}
                            aria-current={category === c ? "true" : undefined}
                            className={`chip uppercase text-xs font-bold tracking-wide ${category === c ? "!bg-ink !text-white" : ""}`}
                        >
                            {c}
                        </Link>
                    ))}
                </div>
                <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                    <input
                        type="search"
                        placeholder="Search shoes"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="field md:max-w-xs"
                    />
                    <div className="flex items-center gap-3 text-sm">
                        <span className="text-ink/60">{visible.length} items</span>
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value as SortKey)}
                            className="field !w-auto !py-2"
                            aria-label="Sort"
                        >
                            {sortOptions.map((o) => (
                                <option key={o.key} value={o.key}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {visible.length === 0 ? (
                <p className="text-center text-ink/60 py-20">No shoes match your filters.</p>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10">
                    {visible.map((p) => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>
            )}

            <div className="text-center mt-14">
                {!done ? (
                    <button onClick={loadMore} disabled={loading} className="btn btn-ghost uppercase text-sm tracking-wide">
                        {loading ? "Loading" : "Load more"}
                    </button>
                ) : (
                    <p className="text-ink/60 text-sm">You&apos;ve seen everything.</p>
                )}
            </div>
        </>
    );
}

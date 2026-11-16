import { Suspense } from "react";
import { getProducts } from "@/lib/products";
import LoadMore from "@/components/LoadMore";
import CategoryTiles from "@/components/CategoryTiles";

export default async function ShopPage() {
    const { products, nextOffset } = await getProducts({ maxRecords: 12 });

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 space-y-14">
            <section>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple mb-2">The collection</p>
                <h1 className="uppercase font-black text-4xl md:text-6xl tracking-tight mb-8">Shop by category</h1>
                <CategoryTiles />
            </section>

            <section>
                <h2 className="uppercase font-black text-2xl tracking-tight mb-6">All shoes</h2>
                <Suspense fallback={null}>
                    <LoadMore initialProducts={products} initialOffset={nextOffset} />
                </Suspense>
            </section>
        </div>
    );
}

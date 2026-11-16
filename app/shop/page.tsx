import { Suspense } from "react";
import { getProducts } from "@/lib/products";
import LoadMore from "@/components/LoadMore";

export default async function ShopPage() {
    const { products, nextOffset } = await getProducts({ maxRecords: 12 });

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple mb-2">The collection</p>
            <h1 className="uppercase font-black text-4xl md:text-6xl tracking-tight mb-10">Shop all</h1>
            <Suspense fallback={null}>
                <LoadMore initialProducts={products} initialOffset={nextOffset} />
            </Suspense>
        </div>
    );
}

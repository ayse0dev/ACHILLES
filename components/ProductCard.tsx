import Link from "next/link";
import type { Product } from "@/lib/airtable";
import ProductArt from "./ProductArt";

export default function ProductCard({ product, showPrice = true }: { product: Product; showPrice?: boolean }) {
    const soldOut = product.stock <= 0;
    const lowStock = !soldOut && product.stock <= 3;
    const photo = product.images[0];

    return (
        <Link href={`/shop/${product.slug}`} className="group block">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-[#f3f1ee] group-hover:scale-[1.02] transition duration-500">
                {photo ? (
                    <img src={photo} alt={product.name} className="w-full h-full object-contain p-4" />
                ) : (
                    <ProductArt name={product.name} />
                )}
                {soldOut && (
                    <span className="absolute top-3 left-3 bg-ink text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                        Sold out
                    </span>
                )}
                {lowStock && (
                    <span className="absolute top-3 left-3 bg-orange text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                        Only {product.stock} left
                    </span>
                )}
            </div>
            <div className="pt-4 space-y-1">
                {product.category && (
                    <p className="text-[11px] font-bold uppercase tracking-wider text-ink/50">{product.category}</p>
                )}
                <p className="font-bold text-base leading-snug group-hover:underline">{product.name}</p>
                {showPrice && <p className="font-bold text-purple">${product.price.toFixed(2)}</p>}
            </div>
        </Link>
    );
}

import Link from "next/link";
import type { Product } from "@/lib/airtable";
import { priceOf } from "@/lib/price";
import ProductArt from "./ProductArt";

export default function ProductCard({ product, showPrice = true }: { product: Product; showPrice?: boolean }) {
    const soldOut = product.stock <= 0;
    const lowStock = !soldOut && product.stock <= 3;
    const photo = product.images[0];
    const price = priceOf(product);
    const onSale = price < product.price;
    const off = onSale ? Math.round((1 - price / product.price) * 100) : 0;

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
                {!soldOut && !lowStock && (onSale || product.badge) && (
                    <span className="absolute top-3 left-3 bg-red text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                        {onSale ? `${off}% off` : product.badge}
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
                {showPrice && (
                    <p className="font-bold text-purple">
                        ₱{price.toFixed(2)}
                        {onSale && <span className="ml-2 text-xs font-normal text-ink/50 line-through">₱{product.price.toFixed(2)}</span>}
                    </p>
                )}
            </div>
        </Link>
    );
}

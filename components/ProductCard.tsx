import Link from "next/link";
import type { Product } from "@/lib/airtable";

export default function ProductCard({ product }: { product: Product }) {
    const soldOut = product.stock <= 0;
    const lowStock = !soldOut && product.stock <= 3;

    return (
        <Link href={`/shop/${product.slug}`} className="group block">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-[#f3f1ee]">
                {product.images[0] ? (
                    <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-contain p-4 group-hover:scale-105 transition duration-500"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-teal/25 via-purple/20 to-orange/30">
                        <span className="font-black text-6xl text-ink/30 uppercase">{product.name.charAt(0)}</span>
                    </div>
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
                <p className="font-bold text-purple">${product.price.toFixed(2)}</p>
            </div>
        </Link>
    );
}

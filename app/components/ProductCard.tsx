import Link from "next/link";
import { Product } from "@/lib/airtable";

export default function ProductCard({ product }: { product: Product }) {
    return (
        <Link
            href={`/shop/${product.slug}`}
            className="block border border-gray-700 bg-gray-800 rounded-lg overflow-hidden hover:shadow-xl hover:border-gray-500 transition duration-200"
        >
            <div className="aspect-square bg-gray-900 relative">
                {product.images[0] ? (

                    <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        No image
                    </div>
                )}
            </div>
            <div className="p-4">
                <div className="font-semibold text-white text-lg">{product.name || "Unnamed Shoe"}</div>
                <div className="text-sm text-gray-400 mt-1">
                    ${(product.price || 0).toFixed(2)}
                </div>
            </div>
        </Link>
    );
}
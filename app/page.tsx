import Link from "next/link";
import { getFeaturedProducts } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

export default async function HomePage() {
    const products = await getFeaturedProducts(12);

    return (
        <div className="space-y-12">
            <section className="bg-gradient-to-r from-amber-100 to-orange-100 px-6 py-20 text-center text-gray-900">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 text-gray-900">
                    Shop shoes. Repair shoes. All in one place.
                </h1>
                <p className="text-lg text-gray-700 mb-8">
                    Quality footwear and expert repair services.
                </p>
                <div className="flex gap-4 justify-center">
                    <Link
                        href="/shop"
                        className="bg-black text-white px-6 py-3 rounded-lg"
                    >
                        Shop Now
                    </Link>
                    <Link
                        href="/repair"
                        className="bg-white border px-6 py-3 rounded-lg"
                    >
                        Request Repair
                    </Link>
                </div>
            </section>

            <section className="px-6">
                <h2 className="text-2xl font-bold mb-4 text-white">Featured Shoes</h2>
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                    {products.map((p) => (
                        <div key={p.id} className="snap-start shrink-0 w-64">
                            <ProductCard product={p} />
                        </div>
                    ))}
                </div>
            </section>

            <section className="px-6 pb-20 text-center">
                <h2 className="text-2xl font-bold mb-2">Download the App</h2>
                <p className="text-gray-600 mb-4">
                    Shop faster and track repairs on the go.
                </p>
                <Link
                    href="/download"
                    className="inline-block bg-black text-white px-6 py-3 rounded-lg"
                >
                    Get the Mobile App
                </Link>
            </section>
        </div>
    );
}
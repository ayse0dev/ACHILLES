import { getProductBySlug } from "@/lib/products";
import { notFound } from "next/navigation";

export default async function ProductPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const product = await getProductBySlug(slug);
    if (!product) notFound();

    return (
        <div className="max-w-5xl mx-auto p-6 grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
                {product.images.map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        key={i}
                        src={src}
                        alt={`${product.name} ${i + 1}`}
                        className="w-full rounded-lg"
                    />
                ))}
            </div>
            <div className="space-y-4">
                <h1 className="text-3xl font-bold">{product.name}</h1>
                <div className="text-2xl">${product.price.toFixed(2)}</div>
                <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                        <span key={s} className="border rounded px-3 py-1 text-sm">
                            {s}
                        </span>
                    ))}
                </div>
                <p className="text-gray-700 whitespace-pre-line">
                    {product.description}
                </p>
                <button className="w-full bg-black text-white py-3 rounded-lg">
                    Add to Cart
                </button>
            </div>
        </div>
    );
}
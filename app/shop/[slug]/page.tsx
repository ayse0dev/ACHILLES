import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/products";
import { getWishlistSlugs } from "@/lib/wishlist";
import { getCurrentUser } from "@/lib/session";
import AddToCart from "@/components/AddToCart";
import ProductGallery from "@/components/ProductGallery";
import WishlistButton from "@/components/WishlistButton";

export default async function ProductPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const product = await getProductBySlug(slug);
    if (!product) notFound();

    const user = await getCurrentUser();
    const saved = user ? (await getWishlistSlugs(user.email)).includes(product.slug) : false;

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
            <nav className="text-xs font-bold uppercase tracking-wide text-ink/60 mb-6 flex gap-2">
                <Link href="/shop" className="hover:underline">Shop</Link>
                {product.category && (
                    <>
                        <span>/</span>
                        <Link href={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:underline">
                            {product.category}
                        </Link>
                    </>
                )}
            </nav>

            <div className="grid lg:grid-cols-[1.3fr_1fr] gap-10 lg:gap-16">
                <ProductGallery images={product.images} name={product.name} />

                <div className="space-y-7 lg:sticky lg:top-28 lg:self-start">
                    <div className="space-y-2">
                        <h1 className="uppercase font-black text-3xl md:text-4xl tracking-tight leading-tight">
                            {product.name}
                        </h1>
                        {product.category && <p className="text-sm text-ink/60">{product.category}</p>}
                    </div>

                    <p className="text-2xl font-bold">${product.price.toFixed(2)}</p>

                    {product.stock > 0 && product.stock <= 3 && (
                        <p className="text-sm font-bold text-orange uppercase tracking-wide">
                            Only {product.stock} left in stock
                        </p>
                    )}

                    <AddToCart
                        product={{
                            slug: product.slug,
                            name: product.name,
                            price: product.price,
                            image: product.images[0],
                            sizes: product.sizes,
                            stock: product.stock,
                        }}
                    />

                    <WishlistButton slug={product.slug} initialSaved={saved} loggedIn={!!user} />

                    <p className="text-ink/80 whitespace-pre-line leading-relaxed">{product.description}</p>

                    <Link href="/sizing" className="inline-block text-sm font-bold underline">
                        Find your size
                    </Link>
                </div>
            </div>
        </div>
    );
}

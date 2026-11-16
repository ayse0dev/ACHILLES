import Link from "next/link";
import { getProductBySlug } from "@/lib/products";
import { getWishlistSlugs } from "@/lib/wishlist";
import { getCurrentUser } from "@/lib/session";
import ProductCard from "@/components/ProductCard";

export default async function WishlistPage() {
    const user = await getCurrentUser();

    if (!user) {
        return (
            <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
                <p className="eyebrow">Your wishlist</p>
                <h1 className="page-title">Log in to see your wishlist</h1>
                <Link href="/login?callbackUrl=/wishlist" className="btn btn-ink">Log in</Link>
            </div>
        );
    }

    const slugs = await getWishlistSlugs(user.email);
    const products = (await Promise.all(slugs.map((s) => getProductBySlug(s)))).filter(
        (p): p is NonNullable<typeof p> => p !== null
    );

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 space-y-8">
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple mb-2">Saved for later</p>
                <h1 className="uppercase font-black text-4xl md:text-5xl tracking-tight">Your wishlist</h1>
            </div>
            {products.length === 0 ? (
                <p className="text-ink/70">Nothing saved yet. <Link href="/shop" className="underline font-bold">Browse shoes</Link>.</p>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10">
                    {products.map((p) => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>
            )}
        </div>
    );
}

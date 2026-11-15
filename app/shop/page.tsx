import { getProducts } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import LoadMore from "@/components/LoadMore";

export default async function ShopPage() {
    const { products } = await getProducts({ maxRecords: 12 });

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Shop All Shoes</h1>
            <LoadMore initialProducts={products} />
        </div>
    );
}
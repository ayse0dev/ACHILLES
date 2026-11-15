import { AirtableBase } from "airtable";
import { Product } from "@/types";

export async function getProducts({ maxRecords, offset }: { maxRecords?: number; offset?: string }) {
  // existing function (placeholder) – unchanged
}

/**
 * Get product recommendations based on category similarity.
 * Simple heuristic: fetch products with the same `category` as the given product ID,
 * limiting to 4 items (excluding the original product).
 */
export async function getRecommendations(productId: string): Promise<Product[]> {
  // Assume we have a `Products` table with fields `Category` and `ID`.
  // First fetch the target product to get its category.
  const target = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products/${productId}`).then(r => r.json());
  const category = target?.category;
  if (!category) return [];
  // Then query Airtable for other products in same category.
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/products?category=${encodeURIComponent(category)}&limit=5`
  ).then(r => r.json());
  // Filter out the original product.
  return (res?.records ?? []).filter((p: any) => p.id !== productId).slice(0, 4);
}

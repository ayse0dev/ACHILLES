import { base } from "./airtable";
import { formulaString } from "./formula";

export async function getWishlistSlugs(email: string): Promise<string[]> {
    const records = await base("Wishlist")
        .select({
            filterByFormula: `LOWER({Email}) = LOWER(${formulaString(email)})`,
            maxRecords: 100,
        })
        .firstPage();
    return records.map((r) => String((r.fields as { Slug?: string }).Slug ?? "")).filter(Boolean);
}

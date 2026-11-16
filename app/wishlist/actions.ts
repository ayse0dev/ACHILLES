"use server";

import { base } from "@/lib/airtable";
import { formulaString } from "@/lib/formula";
import { getCurrentUser } from "@/lib/session";

export async function toggleWishlist(slug: string): Promise<{ saved?: boolean; error?: string }> {
    const user = await getCurrentUser();
    if (!user) return { error: "Log in to save shoes." };

    const filter = `AND(LOWER({Email}) = LOWER(${formulaString(user.email)}), {Slug} = ${formulaString(slug)})`;
    const existing = await base("Wishlist").select({ filterByFormula: filter, maxRecords: 1 }).firstPage();

    if (existing.length > 0) {
        await base("Wishlist").destroy(existing[0].id);
        return { saved: false };
    }

    await base("Wishlist").create({ Email: user.email, Slug: slug });
    return { saved: true };
}

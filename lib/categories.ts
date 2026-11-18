export const productCategories = ["Men", "Women", "Kids", "Sports", "Cleaning"] as const;

export function parseCategory(value: string | null | undefined): string | undefined {
    if (!value) return undefined;
    return productCategories.find((c) => c.toLowerCase() === value.trim().toLowerCase());
}

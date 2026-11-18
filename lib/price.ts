export function priceOf(p: { price: number; salePrice?: number }): number {
    return p.salePrice && p.salePrice > 0 && p.salePrice < p.price ? p.salePrice : p.price;
}

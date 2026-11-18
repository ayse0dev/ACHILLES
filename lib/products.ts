import { mapProduct, Product } from "./airtable";
import { formulaString } from "./formula";

const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TOKEN = process.env.AIRTABLE_TOKEN;

async function fetchFromAirtable(endpoint: string) {
    if (!BASE_ID || !TOKEN) {
        throw new Error("Missing Airtable environment variables");
    }

    const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${endpoint}`, {
        headers: {
            Authorization: `Bearer ${TOKEN}`,
        },
        next: { revalidate: 300 },
    });

    if (!res.ok) {
        throw new Error(`Airtable fetch failed: ${res.statusText}`);
    }

    return res.json();
}

export async function getProducts(opts?: {
    maxRecords?: number;
    offset?: string;
    category?: string;
}): Promise<{ products: Product[]; nextOffset?: string }> {
    const pageSize = opts?.maxRecords ?? 12;

    let query = `Products?pageSize=${pageSize}`;
    if (opts?.offset) {
        query += `&offset=${opts.offset}`;
    }
    if (opts?.category) {
        query += `&filterByFormula=${encodeURIComponent(`LOWER({Category}) = ${formulaString(opts.category.toLowerCase())}`)}`;
    }

    const data = await fetchFromAirtable(query);

    const products = data.records
        .map((r: any) => mapProduct(r))
        .filter((p: Product) => p.name.trim() !== "" && p.price > 0);

    return {
        products,
        nextOffset: data.offset,
    };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
    const formula = encodeURIComponent(`{Slug} = ${formulaString(slug)}`);
    const data = await fetchFromAirtable(`Products?filterByFormula=${formula}&maxRecords=1`);

    if (!data.records || data.records.length === 0) return null;

    return mapProduct(data.records[0]);
}

export async function getSaleProducts(limit = 24): Promise<Product[]> {
    try {
        const formula = encodeURIComponent("AND({SalePrice} > 0, {Stock} > 0)");
        const data = await fetchFromAirtable(`Products?filterByFormula=${formula}&maxRecords=${limit}`);
        return data.records
            .map((r: { id: string; fields: object }) => mapProduct(r))
            .filter((p: Product) => p.name.trim() !== "" && p.price > 0);
    } catch {
        return [];
    }
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
    const { products } = await getProducts({ maxRecords: limit });
    return products;
}

export async function getRecommendations(category?: string, excludeSlug?: string): Promise<Product[]> {
    try {
        const { products } = await getProducts({ maxRecords: 10 });
        return products.filter((p) => p.slug !== excludeSlug).slice(0, 4);
    } catch {
        return [];
    }
}

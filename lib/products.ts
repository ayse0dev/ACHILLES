import { mapProduct, Product, ProductFields } from "./airtable";

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
}): Promise<{ products: Product[]; nextOffset?: string }> {
    const pageSize = opts?.maxRecords ?? 12;


    let query = `Products?pageSize=${pageSize}`;
    if (opts?.offset) {
        query += `&offset=${opts.offset}`;
    }

    const data = await fetchFromAirtable(query);

    return {
        products: data.records.map((r: any) => mapProduct(r)),
        nextOffset: data.offset,
    };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {

    const formula = encodeURIComponent(`{Slug} = "${slug}"`);
    const data = await fetchFromAirtable(`Products?filterByFormula=${formula}&maxRecords=1`);

    if (!data.records || data.records.length === 0) return null;

    return mapProduct(data.records[0]);
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
    const { products } = await getProducts({ maxRecords: limit });
    return products;
}
import Airtable from "airtable";

export const base = new Airtable({
    apiKey: process.env.AIRTABLE_TOKEN,
}).base(process.env.AIRTABLE_BASE_ID!);

export interface ProductFields {
    Name: string;
    Slug: string;
    Price: number;
    Sizes: string;
    Images: string;
    Description: string;
    Stock: number;
    Category?: string;
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    sizes: string[];
    images: string[];
    description: string;
    stock: number;
    category?: string;
}

export function mapProduct(record: {
    id: string;
    fields: Partial<ProductFields>;
}): Product {
    const f = record.fields;
    return {
        id: record.id,
        name: f.Name ?? "",
        slug: f.Slug ?? record.id,
        price: f.Price ?? 0,
        sizes: (f.Sizes ?? "").split(",").map((s) => s.trim()).filter(Boolean),
        images: (f.Images ?? "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        description: f.Description ?? "",
        stock: f.Stock ?? 0,
        category: f.Category,
    };
}
import { NextResponse } from "next/server";
import { getProducts } from "@/lib/products";
import { parseCategory } from "@/lib/categories";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const offset = url.searchParams.get("offset") ?? undefined;
    const limit = Number(url.searchParams.get("limit") ?? 12);
    const category = parseCategory(url.searchParams.get("category"));

    try {
        const data = await getProducts({ maxRecords: limit, offset, category });

        return NextResponse.json(data);
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Failed to load products" },
            { status: 500 }
        );
    }
}
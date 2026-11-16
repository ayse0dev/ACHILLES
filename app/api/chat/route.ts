import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { getFeaturedProducts } from "@/lib/products";

export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

    let productContext = "";
    try {
        const products = await getFeaturedProducts(20);
        productContext = products
            .map(
                (p) =>
                    `- ${p.name} (₱${p.price.toFixed(2)}), sizes: ${p.sizes.join(", ")}`
            )
            .join("\n");
    } catch {
        productContext = "(product catalog temporarily unavailable)";
    }

    const system = `You are the ACHILLES assistant — a friendly helper for a shoe shop that also repairs shoes.
Available products:
${productContext}

You can answer questions about:
- Product sizes, prices, and availability
- How to request a shoe repair (they go to /repair)
- Downloading the mobile app (/download)
- Store policies

Keep answers short and helpful. If asked about specific stock we don't list, say "check the shop page for the latest availability."`;

    const result = streamText({
        model: google("gemini-2.5-flash"),
        system,
        messages,
    });

    return result.toUIMessageStreamResponse();
}
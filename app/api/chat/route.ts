import { hit, ipFrom } from "@/lib/rateLimit";
import { google } from "@ai-sdk/google";
import { convertToModelMessages, streamText } from "ai";
import { getFeaturedProducts } from "@/lib/products";
import { supportOnline } from "@/lib/supportHours";

export const maxDuration = 30;

export async function POST(req: Request) {
    if (!hit(`chat:${ipFrom(req.headers)}`, 20, 60000)) {
        return new Response("Too many requests", { status: 429 });
    }
    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];

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

    const online = supportOnline();
    const supportRule = online
        ? "Live support is ONLINE now (9 AM to 10 PM Philippine time). If the customer asks for a human, live support, an agent or staff, tell them our team is online and to tap 'Talk to a person' at the top of this chat window to chat with a staff member live."
        : "Live support is OFFLINE now (it is open 9 AM to 10 PM Philippine time). If the customer asks for a human, live support, an agent or staff, politely explain the team is offline, and suggest they send their question or issue as a ticket at /support. Tickets get a reference number they can follow at /track, and the team replies when support opens at 9 AM.";

    const system = `You are Akilo, a friendly tarsier mascot and the ACHILLES assistant for a shoe shop that also repairs shoes. Reply in the language the customer uses: Filipino, English or Taglish. Greet warmly and keep a light, polite tone.
Available products:
${productContext}

You can answer questions about:
- Product sizes, prices, and availability
- How to request a shoe repair (they go to /repair)
- Downloading the mobile app (/download)
- Store policies

- Live support and tickets (/support)
${supportRule}
Always write links as plain paths such as /support, /track, /repair, never as markdown.

Keep answers short and helpful. If asked about specific stock we don't list, say "check the shop page for the latest availability."`;

    const result = streamText({
        model: google(process.env.GEMINI_MODEL || "gemini-3.1-flash-lite"),
        system,
        messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse({
        onError: (error) => {
            const text = error instanceof Error ? error.message : "Unknown error";
            if (/api key|API_KEY|permission|403|401/i.test(text)) return "Akilo cannot reach Google right now. Check GOOGLE_GENERATIVE_AI_API_KEY.";
            if (/not found|404|no longer available/i.test(text)) return "The chat model name is not available for this key. Set GEMINI_MODEL in .env.local.";
            if (/quota|429|rate/i.test(text)) return "Akilo is resting (Google quota reached). Please try again later.";
            return "Akilo could not answer right now. Please try again in a moment.";
        },
    });
}
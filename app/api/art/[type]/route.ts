import { productSvg, repairSvg } from "@/lib/artSvg";

const HEX = /^[0-9a-fA-F]{6}$/;

export async function GET(req: Request, ctx: { params: Promise<{ type: string }> }) {
    const { type } = await ctx.params;
    const q = new URL(req.url).searchParams;
    let svg = "";
    if (type === "product") {
        const a = q.get("a") ?? "ff7a3d";
        const b = q.get("b") ?? "1b1340";
        svg = productSvg(q.get("kind") ?? "sneaker", HEX.test(a) ? `#${a}` : "#ff7a3d", HEX.test(b) ? `#${b}` : "#1b1340");
    } else if (type === "repair") {
        svg = repairSvg(q.get("key") ?? "clean");
    } else {
        return new Response("Not found", { status: 404 });
    }
    return new Response(svg, {
        headers: {
            "Content-Type": "image/svg+xml; charset=utf-8",
            "Cache-Control": "public, max-age=31536000, immutable",
            "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'",
        },
    });
}

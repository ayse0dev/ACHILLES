import { headers } from "next/headers";

const buckets = new Map<string, number[]>();

export function hit(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
    if (recent.length >= limit) {
        buckets.set(key, recent);
        return false;
    }
    recent.push(now);
    buckets.set(key, recent);
    if (buckets.size > 5000) {
        for (const [k, v] of buckets) {
            if (v.every((t) => now - t >= windowMs)) buckets.delete(k);
        }
    }
    return true;
}

export function ipFrom(h: Headers): string {
    return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

export async function allow(scope: string, limit: number, windowSec: number, extra = ""): Promise<boolean> {
    const ip = ipFrom(await headers());
    return hit(`${scope}:${ip}:${extra}`, limit, windowSec * 1000);
}

export const TOO_MANY = "Too many attempts. Please wait a few minutes and try again.";

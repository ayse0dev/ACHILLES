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

export function recordFailure(key: string) {
    const list = buckets.get(`fail:${key}`) ?? [];
    list.push(Date.now());
    buckets.set(`fail:${key}`, list);
}

export function clearFailures(key: string) {
    buckets.delete(`fail:${key}`);
}

export function blockedMinutes(key: string, limit: number, windowMs: number): number {
    const now = Date.now();
    const recent = (buckets.get(`fail:${key}`) ?? []).filter((t) => now - t < windowMs);
    buckets.set(`fail:${key}`, recent);
    if (recent.length < limit) return 0;
    return Math.max(1, Math.ceil((recent[0] + windowMs - now) / 60000));
}

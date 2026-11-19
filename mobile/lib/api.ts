import * as SecureStore from "expo-secure-store";

// Set EXPO_PUBLIC_API_URL to point at another server (for example your PC while developing).
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? "https://achiles-omega.vercel.app").replace(/\/$/, "");

export const colors = {
    ink: "#1b1340",
    purple: "#8b3fc7",
    teal: "#19b3c4",
    orange: "#ff7a3d",
    yellow: "#ffc83d",
    muted: "#6b6785",
    line: "#e7e4ee",
    bg: "#ffffff",
};

let token: string | null = null;

export async function loadToken() {
    token = await SecureStore.getItemAsync("achilles-token").catch(() => null);
    return token;
}

export async function setToken(t: string | null) {
    token = t;
    if (t) await SecureStore.setItemAsync("achilles-token", t);
    else await SecureStore.deleteItemAsync("achilles-token").catch(() => null);
}

export class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}

export async function api<T = any>(path: string, body?: unknown): Promise<T> {
    let res: Response;
    try {
        res = await fetch(`${API_URL}${path}`, {
            method: body === undefined ? "GET" : "POST",
            headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            body: body === undefined ? undefined : JSON.stringify(body),
        });
    } catch {
        throw new ApiError("Cannot reach ACHILLES. Check your internet connection.", 0);
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(data?.error ?? "Something went wrong.", res.status);
    return data as T;
}

export type Product = {
    id: string;
    name: string;
    slug: string;
    price: number;
    sizes: string[];
    images: string[];
    description: string;
    stock: number;
    category?: string;
    salePrice?: number;
    badge?: string;
};

export const priceOf = (p: { price: number; salePrice?: number }) =>
    p.salePrice && p.salePrice > 0 && p.salePrice < p.price ? p.salePrice : p.price;

export const peso = (n: number) => `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

// The shop's generated artwork is SVG, which phones cannot draw as an <Image>, so only real photos are returned.
export function imageUrl(src?: string) {
    if (!src || src.includes("/api/art/")) return null;
    return src.startsWith("http") ? src : `${API_URL}${src}`;
}

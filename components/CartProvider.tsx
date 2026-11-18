"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore, ReactNode } from "react";
import { useSession } from "next-auth/react";

export type CartItem = {
    slug: string;
    name: string;
    price: number;
    image?: string;
    size: string;
    qty: number;
};

type CartContextValue = {
    items: CartItem[];
    count: number;
    subtotal: number;
    add: (item: Omit<CartItem, "qty">) => boolean;
    setQty: (slug: string, size: string, qty: number) => void;
    remove: (slug: string, size: string) => void;
    clear: () => void;
};

const LEGACY_KEY = "achilles-cart";
const keyFor = (userId: string) => `achilles-cart:${userId}`;
const CHANGE_EVENT = "achilles-cart-change";
const EMPTY = "[]";

const CartContext = createContext<CartContextValue | null>(null);

function subscribe(callback: () => void) {
    window.addEventListener("storage", callback);
    window.addEventListener(CHANGE_EVENT, callback);
    return () => {
        window.removeEventListener("storage", callback);
        window.removeEventListener(CHANGE_EVENT, callback);
    };
}

function readRaw(key: string): string {
    if (!key) return EMPTY;
    try {
        return localStorage.getItem(key) ?? EMPTY;
    } catch {
        return EMPTY;
    }
}

function parseItems(raw: string): CartItem[] {
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function writeItems(key: string, items: CartItem[]) {
    if (!key) return;
    try {
        localStorage.setItem(key, JSON.stringify(items));
    } catch {
        return;
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
}

function update(key: string, fn: (items: CartItem[]) => CartItem[]) {
    writeItems(key, fn(parseItems(readRaw(key))));
}

export function CartProvider({ children }: { children: ReactNode }) {
    const { data: session } = useSession();
    const userId = String((session?.user as { id?: string } | undefined)?.id ?? "");
    const key = userId ? keyFor(userId) : "";
    const raw = useSyncExternalStore(subscribe, () => readRaw(key), () => EMPTY);

    // The cart belongs to the logged-in account only. Remove the old shared cart that any visitor could see.
    useEffect(() => {
        try {
            localStorage.removeItem(LEGACY_KEY);
        } catch {
            return;
        }
    }, []);
    const items = useMemo(() => parseItems(raw), [raw]);

    const add = useCallback((item: Omit<CartItem, "qty">) => {
        if (!key) {
            window.location.assign(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
            return false;
        }
        update(key, (prev) => {
            const existing = prev.find((p) => p.slug === item.slug && p.size === item.size);
            if (existing) {
                return prev.map((p) => (p === existing ? { ...p, qty: p.qty + 1 } : p));
            }
            return [...prev, { ...item, qty: 1 }];
        });
        return true;
    }, [key]);

    const setQty = useCallback((slug: string, size: string, qty: number) => {
        update(key, (prev) =>
            qty <= 0
                ? prev.filter((p) => !(p.slug === slug && p.size === size))
                : prev.map((p) => (p.slug === slug && p.size === size ? { ...p, qty } : p))
        );
    }, [key]);

    const remove = useCallback((slug: string, size: string) => {
        update(key, (prev) => prev.filter((p) => !(p.slug === slug && p.size === size)));
    }, [key]);

    const clear = useCallback(() => writeItems(key, []), [key]);

    const value = useMemo<CartContextValue>(
        () => ({
            items,
            count: items.reduce((n, i) => n + i.qty, 0),
            subtotal: items.reduce((n, i) => n + i.qty * i.price, 0),
            add,
            setQty,
            remove,
            clear,
        }),
        [items, add, setQty, remove, clear]
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used inside CartProvider");
    return ctx;
}

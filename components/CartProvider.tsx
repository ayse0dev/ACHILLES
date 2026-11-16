"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, ReactNode } from "react";

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
    add: (item: Omit<CartItem, "qty">) => void;
    setQty: (slug: string, size: string, qty: number) => void;
    remove: (slug: string, size: string) => void;
    clear: () => void;
};

const STORAGE_KEY = "achilles-cart";
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

function readRaw(): string {
    try {
        return localStorage.getItem(STORAGE_KEY) ?? EMPTY;
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

function writeItems(items: CartItem[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
        return;
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
}

function update(fn: (items: CartItem[]) => CartItem[]) {
    writeItems(fn(parseItems(readRaw())));
}

export function CartProvider({ children }: { children: ReactNode }) {
    const raw = useSyncExternalStore(subscribe, readRaw, () => EMPTY);
    const items = useMemo(() => parseItems(raw), [raw]);

    const add = useCallback((item: Omit<CartItem, "qty">) => {
        update((prev) => {
            const existing = prev.find((p) => p.slug === item.slug && p.size === item.size);
            if (existing) {
                return prev.map((p) => (p === existing ? { ...p, qty: p.qty + 1 } : p));
            }
            return [...prev, { ...item, qty: 1 }];
        });
    }, []);

    const setQty = useCallback((slug: string, size: string, qty: number) => {
        update((prev) =>
            qty <= 0
                ? prev.filter((p) => !(p.slug === slug && p.size === size))
                : prev.map((p) => (p.slug === slug && p.size === size ? { ...p, qty } : p))
        );
    }, []);

    const remove = useCallback((slug: string, size: string) => {
        update((prev) => prev.filter((p) => !(p.slug === slug && p.size === size)));
    }, []);

    const clear = useCallback(() => writeItems([]), []);

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

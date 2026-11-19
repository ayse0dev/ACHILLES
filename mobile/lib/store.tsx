import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { api, loadToken, setToken } from "./api";

export type User = { id: string; email: string; name: string; role: string };
export type CartItem = { slug: string; name: string; price: number; image?: string; size: string; qty: number; stock: number };

type Ctx = {
    ready: boolean;
    user: User | null;
    signIn: (token: string, user: User) => Promise<void>;
    signOut: () => Promise<void>;
    cart: CartItem[];
    add: (item: CartItem) => void;
    setQty: (slug: string, size: string, qty: number) => void;
    clear: () => void;
    count: number;
    total: number;
};

const StoreContext = createContext<Ctx>(null as never);
export const useStore = () => useContext(StoreContext);

const cartKey = (id: string) => `achilles-cart-${id}`;

export function StoreProvider({ children }: { children: React.ReactNode }) {
    const [ready, setReady] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);

    const loadCart = async (id: string) => {
        const raw = await SecureStore.getItemAsync(cartKey(id)).catch(() => null);
        try {
            setCart(raw ? JSON.parse(raw) : []);
        } catch {
            setCart([]);
        }
    };

    useEffect(() => {
        (async () => {
            const t = await loadToken();
            if (t) {
                const saved = await SecureStore.getItemAsync("achilles-user").catch(() => null);
                let known: User | null = null;
                try { known = saved ? JSON.parse(saved) : null; } catch {}
                if (known) {
                    setUser(known);
                    await loadCart(known.id);
                    setReady(true);
                }
                try {
                    const me = await api<{ user: User }>("/api/mobile/me");
                    setUser(me.user);
                    SecureStore.setItemAsync("achilles-user", JSON.stringify(me.user)).catch(() => null);
                    if (!known) await loadCart(me.user.id);
                } catch (e: any) {
                    if (e?.status === 401) {
                        await setToken(null);
                        await SecureStore.deleteItemAsync("achilles-user").catch(() => null);
                        setUser(null);
                        setCart([]);
                    }
                }
            }
            setReady(true);
        })();
    }, []);

    const persist = useCallback((next: CartItem[], id?: string) => {
        setCart(next);
        if (id) SecureStore.setItemAsync(cartKey(id), JSON.stringify(next)).catch(() => null);
    }, []);

    const value = useMemo<Ctx>(
        () => ({
            ready,
            user,
            cart,
            signIn: async (token, u) => {
                await setToken(token);
                SecureStore.setItemAsync("achilles-user", JSON.stringify(u)).catch(() => null);
                setUser(u);
                await loadCart(u.id);
            },
            signOut: async () => {
                await setToken(null);
                SecureStore.deleteItemAsync("achilles-user").catch(() => null);
                setUser(null);
                setCart([]);
            },
            add: (item) => {
                const found = cart.find((c) => c.slug === item.slug && c.size === item.size);
                const next = found
                    ? cart.map((c) => (c === found ? { ...c, qty: Math.min(c.stock, c.qty + item.qty) } : c))
                    : [...cart, item];
                persist(next, user?.id);
            },
            setQty: (slug, size, qty) =>
                persist(
                    qty <= 0
                        ? cart.filter((c) => !(c.slug === slug && c.size === size))
                        : cart.map((c) => (c.slug === slug && c.size === size ? { ...c, qty: Math.min(c.stock, qty) } : c)),
                    user?.id
                ),
            clear: () => persist([], user?.id),
            count: cart.reduce((s, c) => s + c.qty, 0),
            total: cart.reduce((s, c) => s + c.qty * c.price, 0),
        }),
        [ready, user, cart, persist]
    );

    return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

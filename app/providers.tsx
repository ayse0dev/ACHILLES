"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/components/CartProvider";
import IdleLogout from "@/components/IdleLogout";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <IdleLogout />
            <CartProvider>{children}</CartProvider>
        </SessionProvider>
    );
}

"use client";

import { signOut, useSession } from "next-auth/react";
import { useEffect } from "react";

const IDLE_MS = 30 * 60 * 1000;

export default function IdleLogout() {
    const { status } = useSession();

    useEffect(() => {
        if (status !== "authenticated") return;
        let timer = setTimeout(() => signOut({ callbackUrl: "/login" }), IDLE_MS);
        const reset = () => {
            clearTimeout(timer);
            timer = setTimeout(() => signOut({ callbackUrl: "/login" }), IDLE_MS);
        };
        const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
        events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
        return () => {
            clearTimeout(timer);
            events.forEach((e) => window.removeEventListener(e, reset));
        };
    }, [status]);

    return null;
}

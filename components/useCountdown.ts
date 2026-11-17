"use client";

import { useEffect, useState } from "react";

export function formatWait(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
}

export function useCountdown(seconds: number | undefined, resetKey: unknown) {
    const [remaining, setRemaining] = useState(0);

    useEffect(() => {
        if (!seconds) return;
        const end = Date.now() + seconds * 1000;
        const tick = () => setRemaining(Math.max(0, Math.ceil((end - Date.now()) / 1000)));
        const first = setTimeout(tick, 0);
        const timer = setInterval(tick, 250);
        return () => {
            clearTimeout(first);
            clearInterval(timer);
        };
    }, [seconds, resetKey]);

    return seconds ? remaining : 0;
}

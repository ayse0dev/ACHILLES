"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BellIcon } from "./NavIcons";

type Item = { id: string; title: string; body: string; link: string; read: boolean; createdAt: string };

export default function NotificationBell() {
    const [items, setItems] = useState<Item[]>([]);
    const [unread, setUnread] = useState(0);
    const [open, setOpen] = useState(false);

    const load = useCallback(async () => {
        try {
            const res = await fetch("/api/notifications", { cache: "no-store" });
            const data = await res.json();
            setItems(data.items ?? []);
            setUnread(data.unread ?? 0);
        } catch {
            return;
        }
    }, []);

    useEffect(() => {
        const first = setTimeout(load, 0);
        const timer = setInterval(load, 30000);
        return () => {
            clearTimeout(first);
            clearInterval(timer);
        };
    }, [load]);

    async function toggle() {
        const next = !open;
        setOpen(next);
        if (next && unread > 0) {
            setUnread(0);
            try {
                await fetch("/api/notifications", { method: "POST" });
            } catch {
                return;
            }
        }
    }

    return (
        <div className="relative">
            <button onClick={toggle} aria-label="Notifications" className="relative w-10 h-10 rounded-full border-2 border-ink flex items-center justify-center hover:bg-ink/5">
                <BellIcon />
                {unread > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red text-white text-[10px] rounded-full min-w-[1.1rem] h-[1.1rem] px-1 flex items-center justify-center">
                        {unread}
                    </span>
                )}
            </button>
            {open && (
                <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto card p-2 z-50">
                    {items.length === 0 && <p className="p-4 text-sm text-ink/60">No notifications yet.</p>}
                    {items.map((n) => {
                        const content = (
                            <div className={`p-3 rounded-xl text-left ${n.read ? "" : "bg-teal/15"}`}>
                                <p className="text-sm font-bold">{n.title}</p>
                                <p className="text-xs text-ink/70">{n.body}</p>
                                <p className="text-[10px] text-ink/40 mt-1">
                                    {n.createdAt ? new Date(n.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : ""}
                                </p>
                            </div>
                        );
                        return n.link ? (
                            <Link key={n.id} href={n.link} onClick={() => setOpen(false)} className="block">
                                {content}
                            </Link>
                        ) : (
                            <div key={n.id}>{content}</div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

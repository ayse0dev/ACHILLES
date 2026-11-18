"use client";

import { useEffect, useRef, useState } from "react";
import type { InboxItem, LiveMessage } from "@/lib/liveChat";

function ago(iso: string) {
    const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
    if (s < 60) return "just now";
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
}

export default function LiveInbox() {
    const [items, setItems] = useState<InboxItem[]>([]);
    const [active, setActive] = useState("");
    const [messages, setMessages] = useState<LiveMessage[]>([]);
    const [text, setText] = useState("");
    const [error, setError] = useState("");
    const [showClosed, setShowClosed] = useState(false);
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let stop = false;
        const load = async () => {
            try {
                const res = await fetch("/api/live/staff", { cache: "no-store" });
                if (!res.ok) return;
                const data = (await res.json()) as { items: InboxItem[] };
                if (!stop) setItems(data.items);
            } catch {
                return;
            }
        };
        load();
        const id = setInterval(load, 4000);
        return () => {
            stop = true;
            clearInterval(id);
        };
    }, []);

    useEffect(() => {
        if (!active) return;
        let stop = false;
        const load = async () => {
            try {
                const res = await fetch(`/api/live/staff?session=${active}`, { cache: "no-store" });
                if (!res.ok) return;
                const data = (await res.json()) as { messages: LiveMessage[] };
                if (!stop) setMessages(data.messages);
            } catch {
                return;
            }
        };
        load();
        const id = setInterval(load, 3000);
        return () => {
            stop = true;
            clearInterval(id);
        };
    }, [active]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    const post = async (payload: object) => {
        const res = await fetch("/api/live/staff", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Could not send.");
    };

    const send = async (e: React.FormEvent) => {
        e.preventDefault();
        const body = text.trim();
        if (!body || !active) return;
        setText("");
        setError("");
        try {
            await post({ session: active, body });
            const res = await fetch(`/api/live/staff?session=${active}`, { cache: "no-store" });
            if (res.ok) setMessages(((await res.json()) as { messages: LiveMessage[] }).messages);
        } catch {
            setError("Could not send. Try again.");
        }
    };

    const close = async () => {
        if (!active) return;
        try {
            await post({ session: active, body: "end", close: true });
        } catch {
            setError("Could not close the chat.");
        }
    };

    const visible = items.filter((i) => showClosed || !i.closed);
    const current = items.find((i) => i.session === active);
    const closed = messages.length > 0 && messages[messages.length - 1].sender === "System";

    return (
        <div className="grid md:grid-cols-[260px_1fr] gap-4 items-start">
            <div className="card p-3 space-y-2">
                <label className="flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={showClosed} onChange={(e) => setShowClosed(e.target.checked)} />
                    Show ended chats
                </label>
                {visible.length === 0 && <p className="text-sm text-ink/60 p-2">No live chats right now.</p>}
                {visible.map((i) => (
                    <button
                        key={i.session}
                        onClick={() => setActive(i.session)}
                        className={`w-full text-left rounded-xl px-3 py-2 border-2 ${active === i.session ? "border-ink bg-teal/20" : "border-transparent hover:bg-ink/5"}`}
                    >
                        <p className="flex items-center justify-between gap-2">
                            <span className="font-bold text-sm truncate">{i.name}</span>
                            {i.waiting && !i.closed && <span className="text-[10px] font-semibold bg-orange text-white rounded px-2">Waiting</span>}
                            {i.closed && <span className="text-[10px] text-ink/50">Ended</span>}
                        </p>
                        <p className="text-xs text-ink/60 truncate">{i.lastBody}</p>
                        <p className="text-[10px] text-ink/40">{ago(i.lastAt)}</p>
                    </button>
                ))}
            </div>

            <div className="card p-0 overflow-hidden flex flex-col h-[28rem]">
                {!active ? (
                    <p className="p-6 text-sm text-ink/60">Choose a chat on the left to reply.</p>
                ) : (
                    <>
                        <div className="p-3 border-b border-ink/10 flex items-center justify-between">
                            <p className="font-bold">{current?.name ?? "Customer"}</p>
                            {!closed && <button onClick={close} className="text-xs underline">End chat</button>}
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-3 text-sm">
                            {messages.map((m) =>
                                m.sender === "System" ? (
                                    <p key={m.id} className="text-center text-xs text-ink/50">{m.body}</p>
                                ) : (
                                    <div key={m.id} className={m.sender === "Staff" ? "text-right" : "text-left"}>
                                        <span
                                            className={
                                                m.sender === "Staff"
                                                    ? "inline-block bg-ink text-white rounded-2xl px-3 py-2 max-w-[85%] whitespace-pre-wrap break-words"
                                                    : "inline-block bg-purple/10 text-ink rounded-2xl px-3 py-2 max-w-[85%] whitespace-pre-wrap break-words"
                                            }
                                        >
                                            {m.body}
                                        </span>
                                    </div>
                                )
                            )}
                            <div ref={endRef} />
                        </div>
                        {error && <p className="px-3 text-xs text-red">{error}</p>}
                        {closed ? (
                            <p className="p-3 border-t border-ink/10 text-xs text-ink/60">This chat has ended.</p>
                        ) : (
                            <form onSubmit={send} className="p-3 border-t border-ink/10 flex gap-2">
                                <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Reply..." maxLength={500} className="flex-1 field !py-2 text-sm" />
                                <button className="btn btn-ink !py-2 !px-4 text-sm">Send</button>
                            </form>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

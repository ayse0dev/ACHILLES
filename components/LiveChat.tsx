"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { LiveMessage } from "@/lib/liveChat";

type Saved = { session: string; name: string };

const KEY = "achilles-live";
const WAIT_NOTICE_MS = 120000;

function randomSession() {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function readSaved(): Saved | null {
    try {
        const raw = sessionStorage.getItem(KEY);
        return raw ? (JSON.parse(raw) as Saved) : null;
    } catch {
        return null;
    }
}

function writeSaved(value: Saved | null) {
    try {
        if (value) sessionStorage.setItem(KEY, JSON.stringify(value));
        else sessionStorage.removeItem(KEY);
    } catch {
        return;
    }
}

export default function LiveChat({ defaultName, online, onBack }: { defaultName: string; online: boolean; onBack: () => void }) {
    const [saved, setSaved] = useState<Saved | null>(readSaved);
    const [nameInput, setNameInput] = useState(defaultName);
    const [messages, setMessages] = useState<LiveMessage[]>([]);
    const [text, setText] = useState("");
    const [error, setError] = useState("");
    const [now, setNow] = useState(() => Date.now());
    const endRef = useRef<HTMLDivElement>(null);

    const session = saved?.session ?? "";
    const closed = messages.length > 0 && messages[messages.length - 1].sender === "System";
    const hasStaff = messages.some((m) => m.sender === "Staff");
    const firstAt = messages.length ? new Date(messages[0].createdAt).getTime() : 0;
    const waitedLong = !!saved && !closed && !hasStaff && firstAt > 0 && now - firstAt > WAIT_NOTICE_MS;

    useEffect(() => {
        if (!session) return;
        let stop = false;
        const load = async () => {
            try {
                const res = await fetch(`/api/live?session=${session}`, { cache: "no-store" });
                if (!res.ok) return;
                const data = (await res.json()) as { messages: LiveMessage[] };
                if (!stop) {
                    setMessages(data.messages);
                    setNow(Date.now());
                }
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
    }, [session]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    const post = async (payload: object) => {
        const res = await fetch("/api/live", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) throw new Error(data.error || "Could not send.");
    };

    const start = (e: React.FormEvent) => {
        e.preventDefault();
        const name = nameInput.trim();
        if (!name) return;
        const value = { session: randomSession(), name };
        writeSaved(value);
        setMessages([]);
        setSaved(value);
    };

    const send = async (e: React.FormEvent) => {
        e.preventDefault();
        const body = text.trim();
        if (!body || !saved) return;
        setText("");
        setError("");
        try {
            await post({ session: saved.session, name: saved.name, body });
            const res = await fetch(`/api/live?session=${saved.session}`, { cache: "no-store" });
            if (res.ok) setMessages(((await res.json()) as { messages: LiveMessage[] }).messages);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not send.");
        }
    };

    const end = async () => {
        if (saved && messages.length && !closed) {
            try {
                await post({ session: saved.session, name: saved.name, body: "end", end: true });
            } catch {
                return;
            }
        }
        writeSaved(null);
        setSaved(null);
        setMessages([]);
    };

    if (!online && !saved) {
        return (
            <div className="flex-1 p-4 text-sm space-y-3">
                <p>Live support is offline right now (open 9 AM – 10 PM).</p>
                <Link href="/support" className="btn btn-ink !py-2 !px-4 text-sm inline-block">Send a ticket</Link>
                <button onClick={onBack} className="block underline text-xs">Back to Akilo</button>
            </div>
        );
    }

    if (!saved) {
        return (
            <form onSubmit={start} className="flex-1 p-4 text-sm space-y-3">
                <p className="font-bold">Talk to our team</p>
                <p className="text-ink/70 text-xs">Tell us your name and a staff member will join the chat.</p>
                <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="Your name" maxLength={60} required className="field !py-2 text-sm w-full" />
                <button className="btn btn-ink !py-2 !px-4 text-sm w-full">Start chat</button>
                <button type="button" onClick={onBack} className="block underline text-xs">Back to Akilo</button>
            </form>
        );
    }

    return (
        <>
            <div className="flex-1 overflow-y-auto p-3 space-y-3 text-sm">
                <div className="text-left">
                    <span className="inline-block bg-teal/20 text-ink rounded-2xl px-3 py-2 max-w-[85%]">
                        Hi {saved.name}! Send your question and our team will reply here.
                    </span>
                </div>
                {messages.map((m) =>
                    m.sender === "System" ? (
                        <p key={m.id} className="text-center text-xs text-ink/50">{m.body}</p>
                    ) : (
                        <div key={m.id} className={m.sender === "Customer" ? "text-right" : "text-left"}>
                            {m.sender === "Staff" && <p className="text-[10px] font-black uppercase text-purple">{m.name || "ACHILLES team"}</p>}
                            <span
                                className={
                                    m.sender === "Customer"
                                        ? "inline-block bg-ink text-white rounded-2xl px-3 py-2 max-w-[85%] whitespace-pre-wrap break-words"
                                        : "inline-block bg-purple/10 text-ink rounded-2xl px-3 py-2 max-w-[85%] whitespace-pre-wrap break-words"
                                }
                            >
                                {m.body}
                            </span>
                        </div>
                    )
                )}
                {waitedLong && (
                    <p className="text-xs bg-orange/10 border border-orange/30 rounded-lg p-2">
                        No one has replied yet. You can also <Link href="/support" className="underline font-bold">send a ticket</Link> and we will answer by email.
                    </p>
                )}
                {error && (
                    <p className="text-red-500 text-xs bg-red-50 p-2 rounded border border-red-200">
                        {error.replace("/support", "")} <Link href="/support" className="underline font-bold">Open a ticket</Link>
                    </p>
                )}
                <div ref={endRef} />
            </div>
            {closed ? (
                <div className="p-3 border-t border-gray-200 bg-white flex gap-2">
                    <button onClick={end} className="btn btn-ink !py-2 !px-4 text-sm flex-1">Start a new chat</button>
                    <button onClick={onBack} className="btn !py-2 !px-4 text-sm border-2 border-ink">Akilo</button>
                </div>
            ) : (
                <form onSubmit={send} className="p-3 border-t border-gray-200 bg-white space-y-2">
                    <div className="flex gap-2">
                        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message..." maxLength={500} className="flex-1 field !py-2 text-sm" />
                        <button type="submit" className="btn btn-ink !py-2 !px-4 text-sm">Send</button>
                    </div>
                    <div className="flex justify-between text-xs">
                        <button type="button" onClick={onBack} className="underline">Back to Akilo</button>
                        <button type="button" onClick={end} className="underline">End chat</button>
                    </div>
                </form>
            )}
        </>
    );
}

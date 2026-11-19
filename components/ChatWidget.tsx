"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import LiveChat from "./LiveChat";
import { supportOnline } from "@/lib/supportHours";
import AkiloMascot, { AkiloBranch } from "./AkiloMascot";

const GREETING = "Kamusta! Ano ang maitutulong ko sa inyo?";

type Part = { type: string; text?: string };
type ChatMessage = { id: string; role: string; parts?: Part[] };

function textOf(message: ChatMessage) {
    return (message.parts ?? [])
        .filter((p) => p.type === "text")
        .map((p) => p.text ?? "")
        .join("");
}

const PATHS = /(\/(?:support|track|repair|shop|download|cart)\b)/g;

function linked(text: string) {
    return text.split(PATHS).map((part, i) =>
        i % 2 === 1 ? (
            <Link key={i} href={part} className="underline font-bold text-purple">
                {part}
            </Link>
        ) : (
            part
        )
    );
}

export default function ChatWidget() {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const endRef = useRef<HTMLDivElement>(null);
    const [online, setOnline] = useState(false);
    const [mode, setMode] = useState<"ai" | "live">("ai");
    const { data: session } = useSession();

    useEffect(() => {
        const tick = () => setOnline(supportOnline());
        tick();
        const id = setInterval(tick, 60000);
        return () => clearInterval(id);
    }, []);

    const { messages, sendMessage, status, error } = useChat({
        transport: new DefaultChatTransport({ api: "/api/chat" }),
    });

    const isLoading = status === "submitted" || status === "streaming";

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = input.trim();
        if (!trimmed || isLoading) return;
        setInput("");
        await sendMessage({ text: trimmed });
    };

    return (
        <>
            <div className="fixed bottom-6 right-0 z-50 group w-56 h-44 pointer-events-none">
                {!open && (
                    <div className="absolute bottom-full right-6 mb-0 w-60 opacity-0 translate-y-2 transition duration-300 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0">
                        <div className="relative bg-white border-2 border-ink rounded-2xl px-4 py-3 shadow-lg text-ink">
                            <p className="text-[10px] font-black uppercase tracking-widest text-purple">Akilo</p>
                            <p className="text-sm font-bold leading-snug">{GREETING}</p>
                            <span className="absolute -bottom-2 right-10 w-4 h-4 bg-white border-r-2 border-b-2 border-ink rotate-45" />
                        </div>
                    </div>
                )}
                <button
                    onClick={() => setOpen((v) => !v)}
                    aria-label={open ? "Close chat with Akilo" : "Chat with Akilo"}
                    className={`pointer-events-auto absolute bottom-[18px] right-3 block w-28 akilo-body ${open ? "akilo-out" : ""}`}
                >
                    <AkiloMascot className="w-full h-auto drop-shadow-lg" />
                </button>
                <AkiloBranch className={`pointer-events-none absolute bottom-0 right-0 w-56 h-auto ${open ? "akilo-branch-out" : ""}`} />
            </div>

            {open && (
                <div className="fixed bottom-28 right-6 w-80 max-w-[90vw] h-96 bg-white border border-ink/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-50 text-black">
                    <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-teal/20 to-purple/20 flex items-center justify-between">
                        <div>
                            <p className="font-display text-lg leading-tight">Akilo</p>
                            <p className="text-[11px] text-ink/60">ACHILLES assistant</p>
                        </div>
                        <button onClick={() => setOpen(false)} aria-label="Close chat" className="text-xl font-bold px-2">
                            ×
                        </button>
                    </div>

                    <div className="px-3 py-2 text-xs border-b border-gray-200 bg-white">
                        {online ? (
                            <span>
                                <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1" />
                                Live support is online.{" "}
                                {mode === "live" ? (
                                    <button onClick={() => setMode("ai")} className="underline font-bold">Back to Akilo</button>
                                ) : (
                                    <button onClick={() => setMode("live")} className="underline font-bold">Talk to a person</button>
                                )}
                            </span>
                        ) : (
                            <span>
                                <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mr-1" />
                                Live support is offline (9 AM – 10 PM).{" "}
                                <Link href="/support" className="underline font-bold">Send a ticket</Link>
                            </span>
                        )}
                    </div>

                    {mode === "live" ? (
                        <LiveChat defaultName={session?.user?.name ?? ""} online={online} onBack={() => setMode("ai")} />
                    ) : (
                        <>
                        <div className="flex-1 overflow-y-auto p-3 space-y-3 text-sm">
                            <div className="text-left">
                                <span className="inline-block bg-purple/10 text-ink rounded-2xl px-3 py-2 max-w-[85%]">{GREETING}</span>
                            </div>
    
                            {(messages as ChatMessage[]).map((m) => (
                                <div key={m.id} className={m.role === "user" ? "text-right" : "text-left"}>
                                    <span
                                        className={
                                            m.role === "user"
                                                ? "inline-block bg-ink text-white rounded-2xl px-3 py-2 max-w-[85%]"
                                                : "inline-block bg-purple/10 text-ink rounded-2xl px-3 py-2 max-w-[85%] whitespace-pre-wrap"
                                        }
                                    >
                                        {m.role === "user" ? textOf(m) : linked(textOf(m))}
                                    </span>
                                </div>
                            ))}
    
                            {isLoading && <p className="text-gray-400 text-xs italic">Akilo is typing...</p>}
    
                            {error && (
                                <p className="text-red-500 text-xs bg-red-50 p-2 rounded border border-red-200">
                                    {error.message && error.message.length < 300
                                        ? error.message
                                        : "Akilo could not answer right now. Please try again in a moment."}
                                </p>
                            )}
                            <div ref={endRef} />
                        </div>
    
                        <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 flex gap-2 bg-white">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 field !py-2 text-sm"
                            />
                            <button type="submit" disabled={isLoading} className="btn btn-ink !py-2 !px-4 text-sm">
                                Send
                            </button>
                        </form>
                            </>
                    )}
                </div>
            )}
        </>
    );
}

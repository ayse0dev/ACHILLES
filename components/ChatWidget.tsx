"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";

export default function ChatWidget() {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");

    const { messages, sendMessage, status, error } = useChat({
        transport: new DefaultChatTransport({
            api: "/api/chat",
        }),
    });

    const isLoading = status === "submitted" || status === "streaming";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = input.trim();
        if (!trimmed || isLoading) return;
        setInput("");
        await sendMessage({ text: trimmed });
    };

    return (
        <>
            <button
                onClick={() => setOpen((v) => !v)}
                className="fixed bottom-6 right-6 bg-black text-white rounded-full w-14 h-14 shadow-lg z-50 flex items-center justify-center text-xl hover:bg-gray-800 transition"
                aria-label="Open chat"
            >
                {open ? "×" : "💬"}
            </button>

            {open && (
                <div className="fixed bottom-24 right-6 w-80 max-w-[90vw] h-96 bg-white border border-gray-200 rounded-lg shadow-2xl flex flex-col z-50 text-black">
                    <div className="p-3 border-b border-gray-200 font-semibold bg-gray-50 rounded-t-lg">
                        SoleFix Assistant
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-3 text-sm">
                        {messages.length === 0 && (
                            <p className="text-gray-500">
                                Hi! Ask me about shoes, sizing, or repairs.
                            </p>
                        )}

                        {messages.map((m: any) => {
                            const text =
                                m.text ??
                                (m.parts
                                    ? m.parts
                                          .filter((p: any) => p.type === "text")
                                          .map((p: any) => p.text)
                                          .join("")
                                    : m.content ?? "");
                            return (
                                <div
                                    key={m.id}
                                    className={
                                        m.role === "user"
                                            ? "text-right"
                                            : "text-left"
                                    }
                                >
                                    <span
                                        className={
                                            m.role === "user"
                                                ? "inline-block bg-black text-white rounded-lg px-3 py-2 max-w-[85%]"
                                                : "inline-block bg-gray-100 text-gray-900 rounded-lg px-3 py-2 max-w-[85%] whitespace-pre-wrap"
                                        }
                                    >
                                        {text}
                                    </span>
                                </div>
                            );
                        })}

                        {isLoading && (
                            <p className="text-gray-400 text-xs italic">
                                Assistant is typing...
                            </p>
                        )}

                        {error && (
                            <p className="text-red-500 text-xs bg-red-50 p-2 rounded border border-red-200">
                                Error: Check your OpenAI API key or account balance in the terminal.
                            </p>
                        )}
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="p-3 border-t border-gray-200 flex gap-2 bg-white rounded-b-lg"
                    >
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-black focus:outline-none focus:border-black"
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-black text-white rounded px-4 py-2 text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50"
                        >
                            Send
                        </button>
                    </form>
                </div>
            )}
        </>
    );
}

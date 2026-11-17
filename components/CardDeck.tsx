"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

type Item = { href: string; title: string; text: string };

const colors = ["#19b3c4", "#8b3fc7", "#ff7a3d", "#ffc83d", "#e8374f", "#19b3c4"];
const PULL_DISTANCE = 140;

export default function CardDeck({ items }: { items: Item[] }) {
    const router = useRouter();
    const [index, setIndex] = useState(0);
    const [ready, setReady] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const indexRef = useRef(0);
    const lastWheel = useRef(0);
    const count = items.length;

    const go = useCallback(
        (next: number) => {
            const clamped = Math.max(0, Math.min(count - 1, next));
            indexRef.current = clamped;
            setIndex(clamped);
        },
        [count]
    );

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        function onWheel(e: WheelEvent) {
            if (Math.abs(e.deltaY) < 8) return;
            const next = indexRef.current + (e.deltaY > 0 ? 1 : -1);
            if (next < 0 || next >= count) return;
            e.preventDefault();
            const now = Date.now();
            if (now - lastWheel.current < 450) return;
            lastWheel.current = now;
            go(next);
        }
        el.addEventListener("wheel", onWheel, { passive: false });
        return () => el.removeEventListener("wheel", onWheel);
    }, [count, go]);

    function onKey(e: React.KeyboardEvent) {
        if (e.key === "ArrowDown" || e.key === "ArrowRight") {
            e.preventDefault();
            go(indexRef.current + 1);
        }
        if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
            e.preventDefault();
            go(indexRef.current - 1);
        }
    }

    function open(href: string) {
        setLeaving(true);
        setTimeout(() => router.push(href), 260);
    }

    return (
        <div className="space-y-5">
            <div
                ref={ref}
                tabIndex={0}
                onKeyDown={onKey}
                role="group"
                aria-label="Shortcuts deck. Scroll or use arrow keys to flip, drag a card out to open it."
                className="relative mx-auto w-full max-w-xl h-[21rem] outline-none focus-visible:ring-2 ring-purple rounded-3xl"
            >
                {items.map((item, i) => {
                    const d = i - index;
                    const top = d === 0;
                    const passed = d < 0;
                    const color = colors[i % colors.length];

                    return (
                        <motion.div
                            key={item.href}
                            drag={top && !leaving}
                            dragSnapToOrigin
                            dragElastic={0.25}
                            whileDrag={{ scale: 1.04, rotate: 2, cursor: "grabbing" }}
                            onDrag={(_, info) => setReady(Math.hypot(info.offset.x, info.offset.y) > PULL_DISTANCE)}
                            onDragEnd={(_, info) => {
                                const pulled = Math.hypot(info.offset.x, info.offset.y) > PULL_DISTANCE;
                                setReady(false);
                                if (pulled) open(item.href);
                            }}
                            initial={false}
                            animate={{
                                y: passed ? -70 : leaving && top ? -140 : d * 24,
                                scale: passed ? 1.04 : leaving && top ? 1.08 : 1 - d * 0.045,
                                rotate: passed ? (i % 2 ? 6 : -6) : d === 0 ? 0 : d % 2 ? 1.2 : -1.2,
                                opacity: passed || (leaving && top) ? 0 : d > 4 ? 0 : 1,
                            }}
                            transition={{ type: "spring", stiffness: 220, damping: 24 }}
                            style={{ zIndex: count - Math.abs(d), borderColor: color, pointerEvents: passed || d > 4 ? "none" : "auto" }}
                            className={`absolute inset-x-0 top-0 h-52 card border-t-4 p-7 select-none ${top ? "cursor-grab" : ""}`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <h3 className="uppercase font-black text-xl">{item.title}</h3>
                                <span className="text-xs font-bold text-ink/40">
                                    {i + 1}/{count}
                                </span>
                            </div>
                            {top && (
                                <div className="mt-3 space-y-4">
                                    <p className="text-ink/70">{item.text}</p>
                                    <div className="flex items-center gap-3">
                                        <Link
                                            href={item.href}
                                            onPointerDownCapture={(e) => e.stopPropagation()}
                                            className="btn btn-ink !py-2 !px-5 text-xs uppercase"
                                        >
                                            Open
                                        </Link>
                                        <span className={`text-xs font-bold transition ${ready ? "text-purple" : "text-ink/40"}`}>
                                            {ready ? "Release to open" : "Pull the card out to open"}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            <div className="flex items-center justify-center gap-4">
                <button
                    onClick={() => go(index - 1)}
                    disabled={index === 0}
                    aria-label="Previous card"
                    className="w-9 h-9 rounded-full border-2 border-ink font-black disabled:opacity-30"
                >
                    ↑
                </button>
                <div className="flex gap-2">
                    {items.map((item, i) => (
                        <button
                            key={item.href}
                            onClick={() => go(i)}
                            aria-label={`Show ${item.title}`}
                            aria-current={i === index}
                            className={`h-2.5 rounded-full transition-all ${i === index ? "w-7 bg-ink" : "w-2.5 bg-ink/25"}`}
                        />
                    ))}
                </div>
                <button
                    onClick={() => go(index + 1)}
                    disabled={index === count - 1}
                    aria-label="Next card"
                    className="w-9 h-9 rounded-full border-2 border-ink font-black disabled:opacity-30"
                >
                    ↓
                </button>
            </div>
            <p className="text-center text-xs text-ink/50">Scroll over the deck to flip through. Drag a card out to open it.</p>
        </div>
    );
}

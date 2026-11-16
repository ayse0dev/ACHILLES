"use client";

import { useState, useRef, useEffect } from "react";

type Pair = { label: string; before: string; after: string };

export default function BeforeAfter({ pairs }: { pairs: Pair[] }) {
    const [index, setIndex] = useState(0);
    const [position, setPosition] = useState(50);
    const [sweeping, setSweeping] = useState(false);
    const [animKey, setAnimKey] = useState(0);
    const dragging = useRef(false);
    const box = useRef<HTMLDivElement>(null);
    const pair = pairs[index];

    function setFromClientX(clientX: number) {
        const el = box.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const pct = ((clientX - rect.left) / rect.width) * 100;
        setPosition(Math.min(100, Math.max(0, pct)));
    }

    useEffect(() => {
        function up() {
            dragging.current = false;
        }
        function move(e: PointerEvent) {
            if (dragging.current) setFromClientX(e.clientX);
        }
        window.addEventListener("pointerup", up);
        window.addEventListener("pointermove", move);
        return () => {
            window.removeEventListener("pointerup", up);
            window.removeEventListener("pointermove", move);
        };
    }, []);

    function choose(i: number) {
        setIndex(i);
        setPosition(50);
        setAnimKey((k) => k + 1);
    }

    function sweep() {
        setSweeping(true);
        setPosition(100);
        setTimeout(() => setPosition(0), 50);
        setTimeout(() => setPosition(50), 1800);
        setTimeout(() => setSweeping(false), 2400);
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
                {pairs.map((p, i) => (
                    <button
                        key={p.label}
                        type="button"
                        aria-pressed={i === index}
                        onClick={() => choose(i)}
                        className="chip uppercase text-xs font-bold tracking-wide"
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            <div
                ref={box}
                key={animKey}
                className="relative w-full aspect-[10/7] rounded-3xl overflow-hidden bg-[#e9e7e3] select-none touch-none cursor-ew-resize animate-fade-in"
                onPointerDown={(e) => {
                    dragging.current = true;
                    setFromClientX(e.clientX);
                }}
                role="slider"
                aria-label="Before and after comparison"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(position)}
            >
                <img src={pair.before} alt={`${pair.label} before repair`} className="absolute inset-0 w-full h-full object-cover" draggable={false} />
                <img
                    src={pair.after}
                    alt={`${pair.label} after repair`}
                    className="absolute inset-0 w-full h-full object-cover transition-[clip-path] duration-[1600ms] ease-in-out"
                    style={{ clipPath: `inset(0 0 0 ${position}%)` }}
                    draggable={false}
                />
                <span className="absolute top-4 left-4 bg-white/90 text-ink text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                    Before
                </span>
                <span className="absolute top-4 right-4 bg-ink text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                    After
                </span>
                <div
                    className="absolute top-0 bottom-0 w-[3px] bg-white shadow-[0_0_0_1px_rgba(27,19,64,0.2)] transition-[left] duration-[1600ms] ease-in-out"
                    style={{ left: `${position}%` }}
                >
                    <span className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-ink font-black">
                        ↔
                    </span>
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-ink/70">Drag the slider to compare, or watch the repair sweep.</p>
                <button type="button" onClick={sweep} disabled={sweeping} className="btn btn-ink !py-2 !px-5 text-xs uppercase tracking-wide">
                    {sweeping ? "Repairing..." : "Play repair"}
                </button>
            </div>
        </div>
    );
}

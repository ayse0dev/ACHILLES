"use client";

import Link from "next/link";
import { useState } from "react";

type Tab = {
    key: string;
    label: string;
    title: string;
    points: string[];
    href: string;
    cta: string;
};

export default function HomeTabs({ tabs, dark = false }: { tabs: Tab[]; dark?: boolean }) {
    const [active, setActive] = useState(tabs[0].key);
    const tab = tabs.find((t) => t.key === active) ?? tabs[0];

    const pillBase = dark ? "bg-white/10 border-white/15" : "bg-white border-ink/10";
    const textMain = dark ? "text-white" : "text-ink";
    const textSoft = dark ? "text-white/80" : "text-ink/80";
    const panel = dark ? "bg-white/5 text-white" : "bg-gradient-to-br from-teal/30 via-purple/25 to-orange/35 text-ink/25";

    return (
        <div className="space-y-8">
            <div className={`inline-flex flex-wrap gap-2 p-1.5 rounded-full border ${pillBase}`}>
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        type="button"
                        aria-pressed={active === t.key}
                        onClick={() => setActive(t.key)}
                        className={`px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wide transition ${
                            active === t.key
                                ? dark ? "bg-white text-ink" : "bg-ink text-white"
                                : `${textMain} hover:opacity-70`
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>
            <div className="grid md:grid-cols-2 gap-10 items-center">
                <div className="space-y-5">
                    <h3 className={`uppercase font-black text-3xl md:text-4xl tracking-tight leading-tight ${textMain}`}>
                        {tab.title}
                    </h3>
                    <ul className={`space-y-3 ${textSoft}`}>
                        {tab.points.map((p) => (
                            <li key={p} className="flex gap-3">
                                <span className="text-yellow font-black">→</span>
                                <span>{p}</span>
                            </li>
                        ))}
                    </ul>
                    <Link
                        href={tab.href}
                        className={`btn uppercase text-sm tracking-wide ${dark ? "bg-white text-ink" : "btn-ink"}`}
                    >
                        {tab.cta}
                    </Link>
                </div>
                <div className={`rounded-3xl aspect-[4/3] flex items-center justify-center ${panel}`}>
                    <span className="uppercase font-black text-5xl md:text-6xl tracking-tight">{tab.label}</span>
                </div>
            </div>
        </div>
    );
}

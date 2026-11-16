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
    image?: string;
    artName: string;
};

const accents = [
    { ring: "from-teal to-purple", glow: "bg-teal/50", point: "text-teal", chip: "bg-teal" },
    { ring: "from-purple to-orange", glow: "bg-purple/60", point: "text-purple", chip: "bg-purple" },
    { ring: "from-orange to-yellow", glow: "bg-orange/50", point: "text-orange", chip: "bg-orange" },
];

export default function HomeTabs({ tabs, dark = false }: { tabs: Tab[]; dark?: boolean }) {
    const [active, setActive] = useState(tabs[0].key);
    const index = Math.max(0, tabs.findIndex((t) => t.key === active));
    const tab = tabs[index];
    const accent = accents[index % accents.length];

    return (
        <div className="space-y-10">
            <div className="inline-flex flex-wrap gap-2 p-1.5 rounded-full bg-white/10 backdrop-blur border border-white/15">
                {tabs.map((t, i) => {
                    const on = active === t.key;
                    return (
                        <button
                            key={t.key}
                            type="button"
                            aria-pressed={on}
                            onClick={() => setActive(t.key)}
                            className={`relative px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wide transition duration-300 ${
                                on
                                    ? `bg-gradient-to-r ${accents[i % accents.length].ring} text-white shadow-[0_8px_24px_-6px_rgba(139,63,199,0.8)] scale-105`
                                    : "text-white/80 hover:text-white hover:bg-white/10"
                            }`}
                        >
                            {t.label}
                        </button>
                    );
                })}
            </div>

            <div key={tab.key} className="grid md:grid-cols-2 gap-10 items-center animate-fade-in">
                <div className="space-y-6">
                    <span className={`inline-block h-1.5 w-16 rounded-full bg-gradient-to-r ${accent.ring}`} />
                    <h3 className="uppercase font-black text-3xl md:text-4xl tracking-tight leading-tight text-white">
                        {tab.title}
                    </h3>
                    <ul className="space-y-4 text-white/85">
                        {tab.points.map((p) => (
                            <li key={p} className="flex gap-3 items-start">
                                <span className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${accent.chip}`} />
                                <span>{p}</span>
                            </li>
                        ))}
                    </ul>
                    <Link
                        href={tab.href}
                        className={`inline-flex btn uppercase text-sm tracking-wide bg-gradient-to-r ${accent.ring} text-white hover:scale-105 transition`}
                    >
                        {tab.cta}
                    </Link>
                </div>

                <div className="relative flex items-center justify-center aspect-[4/3]">
                    <span className={`absolute inset-0 m-auto w-4/5 h-4/5 rounded-full blur-3xl ${accent.glow} animate-pulse-slow`} />
                    <span className={`absolute inset-0 m-auto w-3/5 h-3/5 rounded-[40%] border-2 border-white/20 animate-spin-slow`} />
                    {tab.image ? (
                        <img
                            src={tab.image}
                            alt={tab.artName}
                            className="relative max-h-full max-w-full object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.5)] animate-float"
                        />
                    ) : null}
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";

export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
    const [active, setActive] = useState(0);
    const current = images[active];

    return (
        <div className="grid grid-cols-[4rem_1fr] md:grid-cols-[5rem_1fr] gap-4">
            <div className="flex flex-col gap-3">
                {images.map((src, i) => (
                    <button
                        key={src + i}
                        type="button"
                        onClick={() => setActive(i)}
                        aria-label={`Show image ${i + 1}`}
                        aria-pressed={active === i}
                        className={`aspect-square rounded-xl bg-[#f3f1ee] overflow-hidden border-2 ${
                            active === i ? "border-ink" : "border-transparent"
                        }`}
                    >
                        <img src={src} alt="" className="w-full h-full object-contain p-1" />
                    </button>
                ))}
            </div>
            <div className="aspect-square rounded-3xl bg-[#f3f1ee] overflow-hidden">
                {current ? (
                    <img src={current} alt={name} className="w-full h-full object-contain p-6" />
                ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-teal/25 via-purple/20 to-orange/30">
                        <span className="font-black text-8xl text-ink/25 uppercase">{name.charAt(0)}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

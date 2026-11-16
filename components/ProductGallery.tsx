"use client";

import { useState } from "react";
import ProductArt from "./ProductArt";

export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
    const views = images.length > 0 ? images : [""];
    const [active, setActive] = useState(0);
    const current = views[active];

    return (
        <div className="grid grid-cols-[4rem_1fr] md:grid-cols-[5rem_1fr] gap-4">
            <div className="flex flex-col gap-3">
                {views.map((src, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => setActive(i)}
                        aria-label={`Show view ${i + 1}`}
                        aria-pressed={active === i}
                        className={`aspect-square rounded-xl overflow-hidden border-2 bg-[#f3f1ee] ${
                            active === i ? "border-ink" : "border-transparent"
                        }`}
                    >
                        {src ? (
                            <img src={src} alt="" className="w-full h-full object-contain p-1" />
                        ) : (
                            <ProductArt name={`${name} 0`} />
                        )}
                    </button>
                ))}
            </div>
            <div className="aspect-square rounded-3xl overflow-hidden bg-[#f3f1ee]">
                {current ? (
                    <img src={current} alt={name} className="w-full h-full object-contain p-6" />
                ) : (
                    <ProductArt name={name} />
                )}
            </div>
        </div>
    );
}

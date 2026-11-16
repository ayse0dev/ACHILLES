type Pos = { className?: string };

export function Cloud({ className = "", color = "#ffffff", stroke = "#1b1340" }: Pos & { color?: string; stroke?: string }) {
    return (
        <svg viewBox="0 0 160 100" className={`pointer-events-none absolute ${className}`} aria-hidden="true">
            <path
                d="M30 80 C10 80 8 52 30 48 C32 28 60 22 72 38 C80 18 116 20 120 44 C146 42 152 80 128 80 Z"
                fill={color}
                stroke={stroke}
                strokeWidth="4"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export function Bolt({ className = "", color = "#ffc83d", stroke = "#1b1340" }: Pos & { color?: string; stroke?: string }) {
    return (
        <svg viewBox="0 0 80 120" className={`pointer-events-none absolute ${className}`} aria-hidden="true">
            <path
                d="M48 4 L14 66 L38 66 L28 116 L70 44 L46 44 L60 4 Z"
                fill={color}
                stroke={stroke}
                strokeWidth="4"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export function Star({ className = "", color = "#ff7a3d" }: Pos & { color?: string }) {
    return (
        <svg viewBox="0 0 100 100" className={`pointer-events-none absolute ${className}`} aria-hidden="true">
            <path
                d="M50 6 L61 38 L95 38 L67 58 L78 92 L50 72 L22 92 L33 58 L5 38 L39 38 Z"
                fill={color}
                stroke="#1b1340"
                strokeWidth="3"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export function Squiggle({ className = "", color = "#19b3c4" }: Pos & { color?: string }) {
    return (
        <svg viewBox="0 0 160 40" className={`pointer-events-none absolute ${className}`} aria-hidden="true">
            <path
                d="M4 20 Q 20 2 36 20 T 68 20 T 100 20 T 132 20 T 156 20"
                fill="none"
                stroke={color}
                strokeWidth="8"
                strokeLinecap="round"
            />
        </svg>
    );
}

export function Sparkle({ className = "", color = "#e8374f" }: Pos & { color?: string }) {
    return (
        <svg viewBox="0 0 40 40" className={`pointer-events-none absolute ${className}`} aria-hidden="true">
            <path d="M20 0 Q22 18 40 20 Q22 22 20 40 Q18 22 0 20 Q18 18 20 0 Z" fill={color} />
        </svg>
    );
}

export function Ring({ className = "", color = "#8b3fc7" }: Pos & { color?: string }) {
    return (
        <svg viewBox="0 0 100 100" className={`pointer-events-none absolute ${className}`} aria-hidden="true">
            <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="10" strokeDasharray="18 14" strokeLinecap="round" />
        </svg>
    );
}

export function DoodleField({ tone = "light" }: { tone?: "light" | "dark" }) {
    const ink = tone === "dark" ? "#ffffff" : "#1b1340";
    return (
        <>
            <Cloud className="w-40 top-6 left-4 animate-cloud" color="#ffffff" stroke={ink} />
            <Cloud className="w-28 bottom-10 right-6 animate-cloud-slow" color="#c9f3f8" stroke={ink} />
            <Bolt className="w-10 top-1/3 right-8 animate-wiggle" color="#ffc83d" stroke={ink} />
            <Bolt className="w-7 bottom-1/4 left-6 animate-wiggle" color="#ff7a3d" stroke={ink} />
            <Star className="w-9 top-10 right-1/3 animate-wiggle" color="#ff7a3d" />
            <Star className="w-6 bottom-16 left-1/3 animate-wiggle" color="#8b3fc7" />
            <Squiggle className="w-28 bottom-6 left-10 animate-wiggle" color="#19b3c4" />
            <Sparkle className="w-6 top-1/2 left-1/4 animate-wiggle" color="#e8374f" />
            <Sparkle className="w-5 top-8 left-1/2 animate-wiggle" color="#ffc83d" />
            <Ring className="w-12 bottom-1/3 right-1/4 animate-spin-slow" color="#8b3fc7" />
        </>
    );
}

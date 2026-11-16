import { Cloud, Star, Sparkle, Squiggle } from "./Doodles";

function Tarsier({ className = "" }: { className?: string }) {
    return (
        <svg viewBox="0 0 200 250" className={className} aria-hidden="true">
            <rect x="0" y="206" width="200" height="22" rx="11" fill="#8a5a36" stroke="#1b1340" strokeWidth="4" />
            <path d="M150 190 C190 190 196 150 176 126" fill="none" stroke="#1b1340" strokeWidth="5" strokeLinecap="round" />
            <ellipse cx="100" cy="160" rx="42" ry="50" fill="#c99a6b" stroke="#1b1340" strokeWidth="4" />
            <ellipse cx="100" cy="170" rx="24" ry="32" fill="#e8c9a3" />
            <ellipse cx="62" cy="52" rx="16" ry="22" fill="#c99a6b" stroke="#1b1340" strokeWidth="4" transform="rotate(-18 62 52)" />
            <ellipse cx="62" cy="54" rx="8" ry="13" fill="#f4a9b8" transform="rotate(-18 62 52)" />
            <ellipse cx="138" cy="52" rx="16" ry="22" fill="#c99a6b" stroke="#1b1340" strokeWidth="4" transform="rotate(18 138 52)" />
            <ellipse cx="138" cy="54" rx="8" ry="13" fill="#f4a9b8" transform="rotate(18 138 52)" />
            <circle cx="100" cy="92" r="50" fill="#c99a6b" stroke="#1b1340" strokeWidth="4" />
            <circle cx="72" cy="90" r="24" fill="#ffffff" stroke="#1b1340" strokeWidth="4" />
            <circle cx="128" cy="90" r="24" fill="#ffffff" stroke="#1b1340" strokeWidth="4" />
            <circle cx="74" cy="92" r="13" fill="#1b1340" />
            <circle cx="126" cy="92" r="13" fill="#1b1340" />
            <circle cx="79" cy="86" r="4.5" fill="#ffffff" />
            <circle cx="131" cy="86" r="4.5" fill="#ffffff" />
            <path d="M94 114 L106 114 L100 122 Z" fill="#5b3a29" />
            <path d="M88 128 Q100 138 112 128" fill="none" stroke="#1b1340" strokeWidth="4" strokeLinecap="round" />
            <path d="M58 196 q-6 -14 4 -18 q10 2 8 18" fill="#c99a6b" stroke="#1b1340" strokeWidth="4" strokeLinejoin="round" />
            <path d="M142 196 q6 -14 -4 -18 q-10 2 -8 18" fill="#c99a6b" stroke="#1b1340" strokeWidth="4" strokeLinejoin="round" />
        </svg>
    );
}

function WaveLayer({ color, opacity, className }: { color: string; opacity: number; className: string }) {
    return (
        <svg viewBox="0 0 2880 200" preserveAspectRatio="none" className={className} aria-hidden="true">
            <path
                d="M0 100 C 180 20, 360 20, 540 100 S 900 180, 1080 100 S 1260 20, 1440 100 C 1620 20, 1800 20, 1980 100 S 2340 180, 2520 100 S 2700 20, 2880 100 L2880 200 L0 200 Z"
                fill={color}
                opacity={opacity}
            />
        </svg>
    );
}

export default function BackgroundArt() {
    return (
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
            <WaveLayer color="#19b3c4" opacity={0.22} className="absolute bottom-0 left-0 w-[200%] h-40 animate-wave" />
            <WaveLayer color="#8b3fc7" opacity={0.16} className="absolute -bottom-3 left-0 w-[200%] h-32 animate-wave-reverse" />
            <WaveLayer color="#ff7a3d" opacity={0.18} className="absolute -bottom-6 left-0 w-[200%] h-24 animate-wave" />

            <Tarsier className="hidden 2xl:block absolute bottom-24 left-2 w-32 animate-sway origin-bottom" />
            <Tarsier className="hidden 2xl:block absolute top-1/3 -right-4 w-24 -scale-x-100 rotate-6 animate-sway origin-bottom opacity-90" />

            <Cloud className="hidden lg:block w-36 top-24 left-[6%] animate-cloud opacity-70" color="#ffffff" />
            <Cloud className="hidden lg:block w-28 top-1/2 right-[5%] animate-cloud-slow opacity-60" color="#c9f3f8" />
            <Star className="hidden lg:block w-7 top-1/3 left-[3%] animate-wiggle" color="#ffc83d" />
            <Sparkle className="hidden lg:block w-6 top-[18%] right-[8%] animate-wiggle" color="#e8374f" />
            <Squiggle className="hidden lg:block w-24 top-2/3 left-[4%] animate-wiggle opacity-80" color="#8b3fc7" />
        </div>
    );
}

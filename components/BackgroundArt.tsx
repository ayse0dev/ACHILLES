import { Cloud, Star, Sparkle, Squiggle } from "./Doodles";

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


function Sailboat({ className = "" }: { className?: string }) {
    return (
        <svg viewBox="0 0 140 130" className={className} aria-hidden="true">
            <path d="M68 10 L68 88 L20 88 Z" fill="#ffffff" stroke="#1b1340" strokeWidth="4" strokeLinejoin="round" />
            <path d="M76 24 L76 88 L116 88 Z" fill="#ffc83d" stroke="#1b1340" strokeWidth="4" strokeLinejoin="round" />
            <path d="M72 6 L72 92" stroke="#1b1340" strokeWidth="5" strokeLinecap="round" />
            <path d="M72 6 L92 12 L72 18 Z" fill="#e8374f" stroke="#1b1340" strokeWidth="3" strokeLinejoin="round" />
            <path d="M10 92 L130 92 L112 118 L28 118 Z" fill="#ff7a3d" stroke="#1b1340" strokeWidth="4" strokeLinejoin="round" />
            <circle cx="50" cy="104" r="5" fill="#ffffff" stroke="#1b1340" strokeWidth="3" />
            <circle cx="70" cy="104" r="5" fill="#ffffff" stroke="#1b1340" strokeWidth="3" />
            <circle cx="90" cy="104" r="5" fill="#ffffff" stroke="#1b1340" strokeWidth="3" />
        </svg>
    );
}

function Steamboat({ className = "" }: { className?: string }) {
    return (
        <svg viewBox="0 0 180 110" className={className} aria-hidden="true">
            <rect x="52" y="6" width="16" height="30" rx="3" fill="#e8374f" stroke="#1b1340" strokeWidth="4" />
            <rect x="52" y="6" width="16" height="9" fill="#1b1340" />
            <rect x="86" y="14" width="16" height="22" rx="3" fill="#e8374f" stroke="#1b1340" strokeWidth="4" />
            <rect x="86" y="14" width="16" height="7" fill="#1b1340" />
            <rect x="34" y="36" width="104" height="34" rx="6" fill="#ffffff" stroke="#1b1340" strokeWidth="4" />
            <circle cx="56" cy="53" r="7" fill="#19b3c4" stroke="#1b1340" strokeWidth="3" />
            <circle cx="86" cy="53" r="7" fill="#19b3c4" stroke="#1b1340" strokeWidth="3" />
            <circle cx="116" cy="53" r="7" fill="#19b3c4" stroke="#1b1340" strokeWidth="3" />
            <path d="M8 70 L172 70 L148 100 L30 100 Z" fill="#8b3fc7" stroke="#1b1340" strokeWidth="4" strokeLinejoin="round" />
            <path d="M24 84 L156 84" stroke="#ffc83d" strokeWidth="4" strokeLinecap="round" />
        </svg>
    );
}

function Airplane({ className = "" }: { className?: string }) {
    return (
        <svg viewBox="0 0 200 80" className={className} aria-hidden="true">
            <path d="M10 40 L60 40" stroke="#1b1340" strokeOpacity="0.25" strokeWidth="4" strokeDasharray="2 10" strokeLinecap="round" />
            <path d="M84 36 L60 8 L76 8 L108 34 Z" fill="#19b3c4" stroke="#1b1340" strokeWidth="4" strokeLinejoin="round" />
            <path d="M84 46 L60 74 L76 74 L108 48 Z" fill="#19b3c4" stroke="#1b1340" strokeWidth="4" strokeLinejoin="round" />
            <path d="M96 38 C110 28 160 28 184 38 C192 41 192 47 184 50 C160 58 110 58 96 48 Z" fill="#ffffff" stroke="#1b1340" strokeWidth="4" strokeLinejoin="round" />
            <path d="M96 38 L82 24 L98 24 L112 34 Z" fill="#e8374f" stroke="#1b1340" strokeWidth="4" strokeLinejoin="round" />
            <circle cx="150" cy="42" r="5" fill="#ffc83d" stroke="#1b1340" strokeWidth="3" />
            <circle cx="132" cy="42" r="5" fill="#ffc83d" stroke="#1b1340" strokeWidth="3" />
            <circle cx="168" cy="42" r="5" fill="#ffc83d" stroke="#1b1340" strokeWidth="3" />
        </svg>
    );
}

function Cruiser({
    duration,
    delay,
    reverse = false,
    className,
    children,
}: {
    duration: number;
    delay: number;
    reverse?: boolean;
    className: string;
    children: React.ReactNode;
}) {
    return (
        <div
            className={`absolute left-0 ${reverse ? "animate-cross-rev" : "animate-cross"} ${className}`}
            style={{ animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
        >
            {children}
        </div>
    );
}

export default function BackgroundArt() {
    return (
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
            <WaveLayer color="#19b3c4" opacity={0.22} className="absolute bottom-0 left-0 w-[200%] h-40 animate-wave" />
            <WaveLayer color="#8b3fc7" opacity={0.16} className="absolute -bottom-3 left-0 w-[200%] h-32 animate-wave-reverse" />
            <WaveLayer color="#ff7a3d" opacity={0.18} className="absolute -bottom-6 left-0 w-[200%] h-24 animate-wave" />


            <Cruiser duration={70} delay={-12} className="bottom-12 w-28 md:w-36">
                <Sailboat className="w-full animate-bob" />
            </Cruiser>
            <Cruiser duration={95} delay={-60} reverse className="bottom-9 w-32 md:w-44">
                <div className="-scale-x-100"><Steamboat className="w-full animate-bob" /></div>
            </Cruiser>
            <Cruiser duration={55} delay={-30} className="bottom-20 hidden md:block w-20">
                <Sailboat className="w-full animate-bob opacity-80" />
            </Cruiser>

            <Cruiser duration={40} delay={-8} className="top-[14%] w-24 md:w-32">
                <Airplane className="w-full animate-glide" />
            </Cruiser>
            <Cruiser duration={58} delay={-35} reverse className="top-[38%] hidden sm:block w-20 md:w-28">
                <div className="-scale-x-100"><Airplane className="w-full animate-glide opacity-90" /></div>
            </Cruiser>
            <Cruiser duration={75} delay={-50} className="top-[62%] hidden lg:block w-24">
                <Airplane className="w-full animate-glide opacity-80" />
            </Cruiser>

            <Cloud className="hidden lg:block w-36 top-24 left-[6%] animate-cloud opacity-70" color="#ffffff" />
            <Cloud className="hidden lg:block w-28 top-1/2 right-[5%] animate-cloud-slow opacity-60" color="#c9f3f8" />
            <Star className="hidden lg:block w-7 top-1/3 left-[3%] animate-wiggle" color="#ffc83d" />
            <Sparkle className="hidden lg:block w-6 top-[18%] right-[8%] animate-wiggle" color="#e8374f" />
            <Squiggle className="hidden lg:block w-24 top-2/3 left-[4%] animate-wiggle opacity-80" color="#8b3fc7" />
        </div>
    );
}

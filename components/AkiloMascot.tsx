export default function AkiloMascot({ className = "" }: { className?: string }) {
    const ink = "#1b1340";
    return (
        <svg viewBox="0 0 170 210" className={className} aria-hidden="true">
            <ellipse cx="80" cy="150" rx="40" ry="48" fill="#c99a6b" stroke={ink} strokeWidth="4" />
            <ellipse cx="80" cy="160" rx="22" ry="30" fill="#e8c9a3" />
            <ellipse cx="58" cy="196" rx="14" ry="8" fill="#c99a6b" stroke={ink} strokeWidth="4" />
            <ellipse cx="102" cy="196" rx="14" ry="8" fill="#c99a6b" stroke={ink} strokeWidth="4" />
            <path d="M44 140 C28 150 26 172 36 184" fill="none" stroke={ink} strokeWidth="9" strokeLinecap="round" />
            <path d="M44 140 C28 150 26 172 36 184" fill="none" stroke="#c99a6b" strokeWidth="4" strokeLinecap="round" />

            <ellipse cx="42" cy="42" rx="16" ry="22" fill="#c99a6b" stroke={ink} strokeWidth="4" transform="rotate(-18 42 42)" />
            <ellipse cx="42" cy="44" rx="8" ry="13" fill="#f4a9b8" transform="rotate(-18 42 42)" />
            <ellipse cx="118" cy="42" rx="16" ry="22" fill="#c99a6b" stroke={ink} strokeWidth="4" transform="rotate(18 118 42)" />
            <ellipse cx="118" cy="44" rx="8" ry="13" fill="#f4a9b8" transform="rotate(18 118 42)" />
            <circle cx="80" cy="80" r="48" fill="#c99a6b" stroke={ink} strokeWidth="4" />
            <circle cx="54" cy="78" r="24" fill="#ffffff" stroke={ink} strokeWidth="4" />
            <circle cx="106" cy="78" r="24" fill="#ffffff" stroke={ink} strokeWidth="4" />
            <g className="akilo-pupils">
                <circle cx="56" cy="80" r="13" fill={ink} />
                <circle cx="104" cy="80" r="13" fill={ink} />
                <circle cx="61" cy="74" r="4.5" fill="#ffffff" />
                <circle cx="109" cy="74" r="4.5" fill="#ffffff" />
            </g>
            <path d="M74 102 L86 102 L80 110 Z" fill="#5b3a29" />
            <path d="M68 116 Q80 128 92 116" fill="none" stroke={ink} strokeWidth="4" strokeLinecap="round" />

            <g className="akilo-arm" style={{ transformOrigin: "116px 138px" }}>
                <path d="M116 138 C140 134 150 112 146 92" fill="none" stroke={ink} strokeWidth="9" strokeLinecap="round" />
                <path d="M116 138 C140 134 150 112 146 92" fill="none" stroke="#c99a6b" strokeWidth="4" strokeLinecap="round" />
                <circle cx="146" cy="88" r="9" fill="#c99a6b" stroke={ink} strokeWidth="4" />
            </g>
        </svg>
    );
}

export function AkiloBranch({ className = "" }: { className?: string }) {
    const ink = "#1b1340";
    return (
        <svg viewBox="0 0 220 70" className={className} aria-hidden="true">
            <path d="M222 30 C170 28 120 36 70 40 C45 42 25 44 8 52" fill="none" stroke={ink} strokeWidth="18" strokeLinecap="round" />
            <path d="M222 30 C170 28 120 36 70 40 C45 42 25 44 8 52" fill="none" stroke="#8a5a36" strokeWidth="11" strokeLinecap="round" />
            <path d="M150 33 C146 20 138 14 130 10" fill="none" stroke={ink} strokeWidth="10" strokeLinecap="round" />
            <path d="M150 33 C146 20 138 14 130 10" fill="none" stroke="#8a5a36" strokeWidth="5" strokeLinecap="round" />
            <path d="M60 41 C56 54 50 60 42 64" fill="none" stroke={ink} strokeWidth="9" strokeLinecap="round" />
            <path d="M60 41 C56 54 50 60 42 64" fill="none" stroke="#8a5a36" strokeWidth="4" strokeLinecap="round" />
            <ellipse cx="124" cy="8" rx="13" ry="7" fill="#19b3c4" stroke={ink} strokeWidth="3" transform="rotate(-30 124 8)" />
            <ellipse cx="142" cy="12" rx="12" ry="6" fill="#7ad39a" stroke={ink} strokeWidth="3" transform="rotate(25 142 12)" />
            <ellipse cx="36" cy="64" rx="13" ry="6.5" fill="#7ad39a" stroke={ink} strokeWidth="3" transform="rotate(20 36 64)" />
            <ellipse cx="18" cy="52" rx="12" ry="6" fill="#19b3c4" stroke={ink} strokeWidth="3" transform="rotate(-20 18 52)" />
            <ellipse cx="90" cy="48" rx="11" ry="5.5" fill="#7ad39a" stroke={ink} strokeWidth="3" transform="rotate(35 90 48)" />
        </svg>
    );
}

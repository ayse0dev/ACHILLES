const STOPS = ["Order placed", "Packed", "Out for delivery", "Delivered"];

const INDEX: Record<string, number> = {
    "Pending payment": -1,
    Paid: 0,
    Confirmed: 0,
    Packed: 1,
    Shipped: 2,
    Delivered: 3,
};

function Rider() {
    const ink = "#1b1340";
    return (
        <svg viewBox="0 0 90 70" className="w-16 h-auto drop-shadow" aria-hidden="true">
            <g className="ride-bob">
                <rect x="4" y="16" width="26" height="22" rx="3" fill="#ff7a3d" stroke={ink} strokeWidth="3" />
                <path d="M4 24 H30 M17 16 V38" stroke={ink} strokeWidth="2" />
                <path d="M26 40 H62 L70 28 H76" fill="none" stroke={ink} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M62 40 L68 20" fill="none" stroke={ink} strokeWidth="4" strokeLinecap="round" />
                <path d="M62 20 H74" fill="none" stroke={ink} strokeWidth="4" strokeLinecap="round" />
                <ellipse cx="44" cy="30" rx="12" ry="9" fill="#c99a6b" stroke={ink} strokeWidth="3" />
                <circle cx="54" cy="14" r="11" fill="#c99a6b" stroke={ink} strokeWidth="3" />
                <circle cx="50" cy="13" r="4.5" fill="#fff" stroke={ink} strokeWidth="1.5" />
                <circle cx="58" cy="13" r="4.5" fill="#fff" stroke={ink} strokeWidth="1.5" />
                <circle cx="51" cy="13.5" r="2.2" fill={ink} />
                <circle cx="59" cy="13.5" r="2.2" fill={ink} />
                <path d="M47 5 Q54 -1 61 5 L61 7 H47 Z" fill="#19b3c4" stroke={ink} strokeWidth="2" />
            </g>
            <g className="ride-wheel" style={{ transformOrigin: "16px 54px" }}>
                <circle cx="16" cy="54" r="9" fill="#fff" stroke={ink} strokeWidth="4" />
                <path d="M16 46 V62 M8 54 H24" stroke={ink} strokeWidth="2" />
            </g>
            <g className="ride-wheel" style={{ transformOrigin: "72px 54px" }}>
                <circle cx="72" cy="54" r="9" fill="#fff" stroke={ink} strokeWidth="4" />
                <path d="M72 46 V62 M64 54 H80" stroke={ink} strokeWidth="2" />
            </g>
        </svg>
    );
}

export default function DeliveryProgress({ status }: { status: string }) {
    if (status === "Cancelled") {
        return <p className="text-sm font-bold text-red">This order was cancelled.</p>;
    }
    const index = INDEX[status] ?? 0;
    const waiting = index < 0;
    const position = waiting ? 0 : (index / (STOPS.length - 1)) * 100;
    const delivered = index === STOPS.length - 1;

    return (
        <div className="space-y-2">
            <div className="relative h-20 mx-6">
                <div className="absolute left-0 right-0 bottom-3 h-2 rounded-full bg-ink/15" />
                <div className="absolute left-0 bottom-3 h-2 rounded-full bg-teal transition-all duration-1000" style={{ width: `${position}%` }} />
                <div
                    className="absolute bottom-1 transition-all duration-1000 ease-out"
                    style={{ left: `${position}%`, transform: "translateX(-50%)" }}
                >
                    <Rider />
                </div>
                {STOPS.map((s, i) => (
                    <span
                        key={s}
                        className={`absolute bottom-[10px] w-3 h-3 rounded-full border-2 border-ink ${i <= index ? "bg-teal" : "bg-white"}`}
                        style={{ left: `${(i / (STOPS.length - 1)) * 100}%`, translate: "-50% 0" }}
                        aria-hidden="true"
                    />
                ))}
                {delivered && <span className="absolute right-[-14px] top-0 text-2xl" aria-hidden="true">🏠</span>}
            </div>
            <ol className="flex justify-between text-[11px] font-bold uppercase text-center">
                {STOPS.map((s, i) => (
                    <li key={s} className={`flex-1 ${i <= index ? "text-ink" : "text-ink/40"}`}>{s}</li>
                ))}
            </ol>
            <p className="text-xs text-ink/60 text-center">
                {waiting
                    ? "Waiting for your payment to be confirmed."
                    : delivered
                      ? "Delivered. Enjoy your shoes!"
                      : index === 2
                        ? "Your rider is on the way!"
                        : "We are getting your order ready."}
            </p>
        </div>
    );
}

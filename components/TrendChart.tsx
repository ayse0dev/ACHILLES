import type { DayTotal } from "./MoneyFlow";

function path(values: number[], max: number, w: number, h: number) {
    const step = w / Math.max(1, values.length - 1);
    return values.map((v, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)} ${(h - (v / max) * h).toFixed(1)}`).join(" ");
}

export default function TrendChart({ days }: { days: DayTotal[] }) {
    const w = 600;
    const h = 180;
    const max = Math.max(1, ...days.map((d) => Math.max(d.shop, d.repair)));
    const shop = path(days.map((d) => d.shop), max, w, h);
    const repair = path(days.map((d) => d.repair), max, w, h);

    return (
        <div className="space-y-2">
            <svg viewBox={`-4 -8 ${w + 8} ${h + 16}`} className="w-full h-48" role="img" aria-label="Shop and repair income, last 14 days">
                {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                    <line key={t} x1="0" x2={w} y1={h * t} y2={h * t} stroke="currentColor" strokeOpacity="0.1" />
                ))}
                <path d={`${shop} L${w} ${h} L0 ${h} Z`} fill="var(--color-purple)" fillOpacity="0.15" />
                <path d={shop} fill="none" stroke="var(--color-purple)" strokeWidth="3" strokeLinejoin="round" />
                <path d={repair} fill="none" stroke="var(--color-teal)" strokeWidth="3" strokeLinejoin="round" />
            </svg>
            <div className="flex justify-between text-[10px] text-ink/50">
                <span>{days[0]?.label}</span>
                <span>{days[days.length - 1]?.label}</span>
            </div>
            <p className="text-xs text-ink/60">
                <span className="inline-block w-3 h-3 bg-purple align-middle mr-1" />Shop
                <span className="inline-block w-3 h-3 bg-teal align-middle ml-4 mr-1" />Repairs
            </p>
        </div>
    );
}

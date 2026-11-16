export type DayTotal = { label: string; shop: number; repair: number };

const peso = (n: number) => `₱${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function MoneyFlow({ days, shopTotal, repairTotal }: { days: DayTotal[]; shopTotal: number; repairTotal: number }) {
    const max = Math.max(1, ...days.map((d) => d.shop + d.repair));

    return (
        <div className="card p-6 space-y-5 sm:col-span-2 lg:col-span-4">
            <div className="flex flex-wrap gap-6">
                <div>
                    <p className="text-xs uppercase font-bold text-ink/60">Shop sales</p>
                    <p className="text-3xl font-black text-purple">{peso(shopTotal)}</p>
                </div>
                <div>
                    <p className="text-xs uppercase font-bold text-ink/60">Completed repairs</p>
                    <p className="text-3xl font-black text-teal">{peso(repairTotal)}</p>
                </div>
                <div>
                    <p className="text-xs uppercase font-bold text-ink/60">Total money in</p>
                    <p className="text-3xl font-black">{peso(shopTotal + repairTotal)}</p>
                </div>
            </div>
            <div className="flex items-end gap-2 h-40" role="img" aria-label="Money in over the last 14 days">
                {days.map((d) => (
                    <div key={d.label} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
                        <div className="w-full flex flex-col justify-end flex-1">
                            <div className="bg-teal rounded-t" style={{ height: `${(d.repair / max) * 100}%` }} />
                            <div className="bg-purple" style={{ height: `${(d.shop / max) * 100}%` }} />
                        </div>
                        <span className="text-[10px] text-ink/60">{d.label}</span>
                    </div>
                ))}
            </div>
            <p className="text-xs text-ink/60">
                <span className="inline-block w-3 h-3 bg-purple align-middle mr-1" />Shop
                <span className="inline-block w-3 h-3 bg-teal align-middle ml-4 mr-1" />Repairs
            </p>
        </div>
    );
}

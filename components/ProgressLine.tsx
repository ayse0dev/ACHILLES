export default function ProgressLine({ steps, current }: { steps: string[]; current: string }) {
    const index = Math.max(0, steps.indexOf(current));
    return (
        <ol className="flex items-start w-full">
            {steps.map((s, i) => {
                const done = i <= index;
                return (
                    <li key={s} className="flex-1 flex flex-col items-center text-center relative">
                        {i > 0 && (
                            <span
                                className={`absolute top-3 right-1/2 w-full h-1 ${i <= index ? "bg-teal" : "bg-ink/15"}`}
                                aria-hidden="true"
                            />
                        )}
                        <span
                            className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                done ? "bg-teal text-white" : "bg-ink/15 text-ink/50"
                            }`}
                        >
                            {done ? "✓" : i + 1}
                        </span>
                        <span className={`mt-2 text-[11px] font-bold uppercase ${done ? "text-ink" : "text-ink/40"}`}>{s}</span>
                    </li>
                );
            })}
        </ol>
    );
}

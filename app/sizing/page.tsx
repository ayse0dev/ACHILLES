import Link from "next/link";

const rows = [
    { eu: "38", uk: "5", us: "7", cm: "24.0" },
    { eu: "39", uk: "6", us: "7.5", cm: "24.5" },
    { eu: "40", uk: "6.5", us: "8", cm: "25.0" },
    { eu: "41", uk: "7", us: "8.5", cm: "25.5" },
    { eu: "42", uk: "8", us: "9", cm: "26.5" },
    { eu: "43", uk: "9", us: "10", cm: "27.5" },
    { eu: "44", uk: "9.5", us: "10.5", cm: "28.0" },
    { eu: "45", uk: "10", us: "11", cm: "28.5" },
];

const steps = [
    "Stand on a sheet of paper against a wall, with your heel touching the wall.",
    "Mark the tip of your longest toe and measure from the wall to the mark, in centimeters.",
    "Measure both feet and use the longer one.",
    "Find the closest centimeter value in the chart and pick that size.",
];

export default function SizingPage() {
    return (
        <div className="max-w-3xl mx-auto px-4 py-12 space-y-12">
            <div>
                <p className="eyebrow mb-2">Fit guide</p>
                <h1 className="page-title">Find your size</h1>
                <p className="text-ink/70 mt-3">
                    Sizes vary a little between brands. Use this chart as a starting point, and check the product page for brand-specific notes.
                </p>
            </div>

            <section className="space-y-4">
                <h2 className="font-display font-bold text-2xl">Measure your foot</h2>
                <ol className="space-y-3">
                    {steps.map((s, i) => (
                        <li key={i} className="card p-4 flex gap-4 items-start">
                            <span className="font-black text-purple text-xl">{i + 1}</span>
                            <span className="text-ink/80">{s}</span>
                        </li>
                    ))}
                </ol>
            </section>

            <section className="space-y-4">
                <h2 className="font-display font-bold text-2xl">Size chart</h2>
                <div className="card overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-ink text-white">
                            <tr>
                                <th className="p-3">EU</th>
                                <th className="p-3">UK</th>
                                <th className="p-3">US</th>
                                <th className="p-3">Foot length (cm)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r, i) => (
                                <tr key={r.eu} className={i % 2 ? "bg-purple/5" : ""}>
                                    <td className="p-3 font-bold">{r.eu}</td>
                                    <td className="p-3">{r.uk}</td>
                                    <td className="p-3">{r.us}</td>
                                    <td className="p-3">{r.cm}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="text-xs text-ink/60">Approximate conversions. Men&apos;s sizing shown.</p>
            </section>

            <div className="text-center">
                <Link href="/shop" className="btn btn-accent">Shop shoes</Link>
            </div>
        </div>
    );
}

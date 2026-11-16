import Link from "next/link";

const guides = [
    {
        title: "Clean leather shoes",
        color: "border-teal",
        tips: [
            "Wipe off dust with a soft dry cloth.",
            "Use a damp cloth and a little mild soap for stains, then dry at room temperature.",
            "Condition the leather every few months so it stays flexible.",
        ],
    },
    {
        title: "Care for sneakers",
        color: "border-orange",
        tips: [
            "Remove loose dirt with a soft brush before washing.",
            "Clean with lukewarm water and mild soap, not the washing machine dryer.",
            "Let them air dry away from direct heat and stuff them with paper to keep their shape.",
        ],
    },
    {
        title: "Make your shoes last longer",
        color: "border-purple",
        tips: [
            "Rotate between two pairs so each one rests a day between wears.",
            "Use shoe trees or stuffing when you store them.",
            "Replace worn soles early. A quick sole repair costs far less than a new pair.",
        ],
    },
];

export default function CarePage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
            <div>
                <p className="eyebrow mb-2">Shoe care guide</p>
                <h1 className="page-title">Keep them fresh</h1>
                <p className="text-ink/70 mt-3">Simple habits that make your shoes look better and last longer.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {guides.map((g) => (
                    <article key={g.title} className={`card p-6 border-t-4 ${g.color}`}>
                        <h2 className="font-display font-bold text-xl mb-3">{g.title}</h2>
                        <ul className="space-y-2 text-sm text-ink/80 list-disc pl-5">
                            {g.tips.map((t) => (
                                <li key={t}>{t}</li>
                            ))}
                        </ul>
                    </article>
                ))}
            </div>

            <div className="card p-8 text-center space-y-4">
                <h2 className="page-title !text-2xl">Worn out? We can help.</h2>
                <Link href="/repair" className="btn btn-ink">Request a repair</Link>
            </div>
        </div>
    );
}

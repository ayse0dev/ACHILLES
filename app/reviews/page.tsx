import { base } from "@/lib/airtable";
import { getCurrentUser } from "@/lib/session";
import ReviewForm from "@/components/ReviewForm";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
    const user = await getCurrentUser();
    const records = await base("Reviews")
        .select({
            filterByFormula: "{Approved}",
            sort: [{ field: "CreatedAt", direction: "desc" }],
            maxRecords: 50,
        })
        .firstPage();

    const reviews = records.map((r) => {
        const f = r.fields as { Name?: string; Rating?: number; Comment?: string; PhotoUrl?: string };
        return {
            id: r.id,
            name: f.Name ?? "Customer",
            rating: Math.min(5, Math.max(1, Math.round(f.Rating ?? 0))),
            comment: f.Comment ?? "",
            photoUrl: f.PhotoUrl,
        };
    });

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 space-y-12">
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple mb-2">Community</p>
                <h1 className="uppercase font-black text-4xl md:text-5xl tracking-tight">Repair reviews</h1>
                <p className="text-ink/70 mt-3">See what customers say about their repaired shoes.</p>
            </div>

            <div className="grid md:grid-cols-[1fr_1.2fr] gap-10">
                <div className="space-y-4">
                    {reviews.length === 0 && (
                        <p className="text-ink/60">No reviews yet. Be the first to share yours.</p>
                    )}
                    {reviews.map((r) => (
                        <article key={r.id} className="card p-5 space-y-2">
                            <p className="text-purple font-black">
                                {"★".repeat(r.rating)}
                                {"☆".repeat(5 - r.rating)}
                            </p>
                            <p className="text-ink/85">{r.comment}</p>
                            {r.photoUrl && (
                                <img src={r.photoUrl} alt="Repaired shoe" className="w-full max-h-72 object-cover rounded-2xl" />
                            )}
                            <p className="text-xs font-bold uppercase text-ink/50">{r.name}</p>
                        </article>
                    ))}
                </div>

                <div className="card p-6 md:p-8 h-fit">
                    <ReviewForm loggedIn={!!user} />
                </div>
            </div>
        </div>
    );
}

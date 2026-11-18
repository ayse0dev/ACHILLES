import { getCurrentUser } from "@/lib/session";
import { base } from "@/lib/airtable";
import BookingForm from "@/components/BookingForm";

export const dynamic = "force-dynamic";

export default async function BookPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
    const { service } = await searchParams;
    const user = await getCurrentUser();
    let phone = "";
    if (user) {
        try {
            const record = await base("Users").find(user.id);
            phone = String((record.fields as { Phone?: string }).Phone ?? "");
        } catch {
            phone = "";
        }
    }

    return (
        <div className="relative z-10 bg-gradient-to-br from-[#f8f6f3] via-[#efebe6] to-[#e7e2dc] min-h-screen overflow-hidden">
            <div className="max-w-[1500px] mx-auto px-4 md:px-10 py-12 space-y-10">
                <div style={{ fontFamily: '"Inter", ui-sans-serif, system-ui, "Segoe UI", "Helvetica Neue", Arial, sans-serif' }}>
                    <p className="uppercase tracking-[0.22em] text-[12px] font-bold text-[#7d7d7d] mb-2">Repair booking</p>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-[#1b1b1b]">Book a repair</h1>
                    <p className="text-[#666] text-lg mt-3">Pick your services, tell us about your shoes, and see an estimate before you submit.</p>
                </div>
                <BookingForm
                    signedIn={!!user}
                    defaultName={user?.name ?? ""}
                    defaultEmail={user?.email ?? ""}
                    defaultPhone={phone}
                    presetService={service ?? ""}
                />
            </div>
        </div>
    );
}

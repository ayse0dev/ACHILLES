import { base } from "@/lib/airtable";
import { getCurrentUser } from "@/lib/session";
import AdminRepairRow from "@/components/AdminRepairRow";
import { isStaff } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
    const user = await getCurrentUser();

    if (!user || !isStaff(user.role)) {
        return (
            <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
                <p className="eyebrow">Admin</p>
                <h1 className="page-title">Not authorized</h1>
                <p className="text-ink/70">This page is for ACHILLES staff and admins only.</p>
            </div>
        );
    }

    const records = await base("RepairRequests")
        .select({
            sort: [{ field: "SubmittedAt", direction: "desc" }],
            maxRecords: 50,
        })
        .firstPage();

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 space-y-8">
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple mb-2">Staff</p>
                <h1 className="uppercase font-black text-4xl tracking-tight">Repair requests</h1>
                <p className="text-ink/70 mt-2">Update the status and quote. Customers are emailed when something changes.</p>
            </div>

            {records.length === 0 && <p className="text-ink/60">No repair requests yet.</p>}

            <div className="space-y-4">
                {records.map((r) => {
                    const f = r.fields as {
                        Name?: string;
                        Email?: string;
                        ShoeDescription?: string;
                        Issue?: string;
                        Status?: string;
                        Quote?: number;
                        SubmittedAt?: string;
                    };
                    return (
                        <AdminRepairRow
                            key={`${r.id}-${f.Status}-${f.Quote ?? ""}`}
                            id={r.id}
                            name={f.Name ?? ""}
                            email={f.Email ?? ""}
                            shoe={f.ShoeDescription ?? ""}
                            issue={f.Issue ?? ""}
                            status={f.Status ?? "Pending"}
                            quote={f.Quote}
                            submitted={f.SubmittedAt ? new Date(f.SubmittedAt).toLocaleString("en-US") : ""}
                        />
                    );
                })}
            </div>
        </div>
    );
}

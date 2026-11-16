import Link from "next/link";
import { base } from "@/lib/airtable";
import { getCurrentUser } from "@/lib/session";
import { isAdmin, isStaff } from "@/lib/roles";
import AdminRepairRow from "@/components/AdminRepairRow";
import AdminOrderRow from "@/components/AdminOrderRow";
import AdminStockRow from "@/components/AdminStockRow";
import AdminUserRow from "@/components/AdminUserRow";

export const dynamic = "force-dynamic";

const staffTabs = [
    { key: "overview", label: "Overview" },
    { key: "repairs", label: "Repairs" },
    { key: "orders", label: "Orders" },
    { key: "deliveries", label: "Deliveries" },
    { key: "stock", label: "Stock" },
];

function fmtDate(value?: string) {
    return value ? new Date(value).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "";
}

export default async function AdminPage({
    searchParams,
}: {
    searchParams: Promise<{ tab?: string }>;
}) {
    const { tab = "overview" } = await searchParams;
    const user = await getCurrentUser();

    if (!user || !isStaff(user.role)) {
        return (
            <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
                <p className="eyebrow">Staff</p>
                <h1 className="page-title">Not authorized</h1>
                <p className="text-ink/70">This dashboard is for ACHILLES staff and admins only.</p>
            </div>
        );
    }

    const admin = isAdmin(user.role);
    const tabs = admin ? [...staffTabs, { key: "users", label: "Users" }] : staffTabs;
    const activeTab = tabs.some((t) => t.key === tab) ? tab : "overview";

    const [repairRecords, orderRecords, productRecords, intakeRecords, userRecords] = await Promise.all([
        base("RepairRequests").select({ sort: [{ field: "SubmittedAt", direction: "desc" }], maxRecords: 100 }).firstPage(),
        base("Orders").select({ sort: [{ field: "CreatedAt", direction: "desc" }], maxRecords: 100 }).firstPage(),
        base("Products").select({ sort: [{ field: "Name", direction: "asc" }], maxRecords: 100 }).firstPage(),
        base("StockIntakes").select({ sort: [{ field: "CreatedAt", direction: "desc" }], maxRecords: 30 }).firstPage().catch(() => []),
        admin ? base("Users").select({ sort: [{ field: "Email", direction: "asc" }], maxRecords: 200 }).firstPage() : Promise.resolve([]),
    ]);

    const openRepairs = repairRecords.filter((r) => (r.fields as { Status?: string }).Status !== "Completed").length;
    const lowStock = productRecords.filter((p) => Number((p.fields as { Stock?: number }).Stock ?? 0) <= 3);
    const toShip = orderRecords.filter((o) => ["Paid", "Packed"].includes(String((o.fields as { Status?: string }).Status)));
    const deliveries = orderRecords.filter((o) => ["Packed", "Shipped", "Delivered"].includes(String((o.fields as { Status?: string }).Status)));

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 space-y-8">
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple mb-2">{admin ? "Admin" : "Staff"} dashboard</p>
                <h1 className="uppercase font-black text-4xl tracking-tight">Operations</h1>
            </div>

            <nav className="flex flex-wrap gap-2">
                {tabs.map((t) => (
                    <Link
                        key={t.key}
                        href={`/admin?tab=${t.key}`}
                        className={`chip uppercase text-xs font-bold tracking-wide ${activeTab === t.key ? "!bg-ink !text-white" : ""}`}
                        aria-current={activeTab === t.key ? "page" : undefined}
                    >
                        {t.label}
                    </Link>
                ))}
            </nav>

            {activeTab === "overview" && (
                <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="card p-6"><p className="text-xs uppercase font-bold text-ink/60">Open repairs</p><p className="text-4xl font-black">{openRepairs}</p></div>
                    <div className="card p-6"><p className="text-xs uppercase font-bold text-ink/60">Orders to pack or ship</p><p className="text-4xl font-black">{toShip.length}</p></div>
                    <div className="card p-6"><p className="text-xs uppercase font-bold text-ink/60">Low stock products</p><p className="text-4xl font-black text-orange">{lowStock.length}</p></div>
                    <div className="card p-6"><p className="text-xs uppercase font-bold text-ink/60">Total orders</p><p className="text-4xl font-black">{orderRecords.length}</p></div>
                    <div className="card p-6 sm:col-span-2 lg:col-span-4 space-y-2">
                        <p className="font-black uppercase">Low stock</p>
                        {lowStock.length === 0 ? (
                            <p className="text-ink/60 text-sm">Nothing is running low.</p>
                        ) : (
                            <ul className="text-sm space-y-1">
                                {lowStock.map((p) => (
                                    <li key={p.id}>{String((p.fields as { Name?: string }).Name)} — {Number((p.fields as { Stock?: number }).Stock ?? 0)} left</li>
                                ))}
                            </ul>
                        )}
                    </div>
                </section>
            )}

            {activeTab === "repairs" && (
                <section className="space-y-4">
                    {repairRecords.length === 0 && <p className="text-ink/60">No repair requests yet.</p>}
                    {repairRecords.map((r) => {
                        const f = r.fields as { Name?: string; Email?: string; ShoeDescription?: string; Issue?: string; Status?: string; Quote?: number; SubmittedAt?: string };
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
                                submitted={fmtDate(f.SubmittedAt)}
                            />
                        );
                    })}
                </section>
            )}

            {activeTab === "orders" && (
                <section className="space-y-4">
                    {orderRecords.length === 0 && <p className="text-ink/60">No orders yet.</p>}
                    {orderRecords.map((o) => {
                        const f = o.fields as { Email?: string; Items?: string; Total?: number; Status?: string; Tracking?: string; CreatedAt?: string };
                        return (
                            <AdminOrderRow
                                key={`${o.id}-${f.Status}-${f.Tracking ?? ""}`}
                                id={o.id}
                                email={f.Email ?? ""}
                                items={f.Items ?? ""}
                                total={f.Total ?? 0}
                                status={f.Status ?? "Paid"}
                                tracking={f.Tracking ?? ""}
                                created={fmtDate(f.CreatedAt)}
                            />
                        );
                    })}
                </section>
            )}

            {activeTab === "deliveries" && (
                <section className="space-y-4">
                    <p className="text-sm text-ink/70">Orders that are packed, shipped or delivered. Add the tracking number when it ships.</p>
                    {deliveries.length === 0 && <p className="text-ink/60">No deliveries yet.</p>}
                    {deliveries.map((o) => {
                        const f = o.fields as { Email?: string; Items?: string; Total?: number; Status?: string; Tracking?: string; CreatedAt?: string };
                        return (
                            <AdminOrderRow
                                key={`${o.id}-${f.Status}-${f.Tracking ?? ""}`}
                                id={o.id}
                                email={f.Email ?? ""}
                                items={f.Items ?? ""}
                                total={f.Total ?? 0}
                                status={f.Status ?? "Packed"}
                                tracking={f.Tracking ?? ""}
                                created={fmtDate(f.CreatedAt)}
                            />
                        );
                    })}
                </section>
            )}

            {activeTab === "stock" && (
                <section className="space-y-8">
                    <div className="space-y-4">
                        <h2 className="font-black uppercase text-xl">Current stock</h2>
                        {productRecords.length === 0 && <p className="text-ink/60">No products in Airtable yet.</p>}
                        {productRecords.map((p) => {
                            const f = p.fields as { Name?: string; Slug?: string; Stock?: number };
                            return (
                                <AdminStockRow
                                    key={`${p.id}-${f.Stock ?? 0}`}
                                    slug={f.Slug ?? ""}
                                    name={f.Name ?? ""}
                                    stock={Number(f.Stock ?? 0)}
                                />
                            );
                        })}
                    </div>
                    <div className="space-y-3">
                        <h2 className="font-black uppercase text-xl">Stock-in history</h2>
                        {intakeRecords.length === 0 && <p className="text-ink/60 text-sm">No stock movements logged yet.</p>}
                        <ul className="card divide-y divide-ink/10">
                            {intakeRecords.map((i) => {
                                const f = i.fields as { Product?: string; Quantity?: number; Note?: string; CreatedAt?: string };
                                const q = Number(f.Quantity ?? 0);
                                return (
                                    <li key={i.id} className="p-4 flex flex-wrap justify-between gap-2 text-sm">
                                        <span className="font-bold">{f.Product}</span>
                                        <span className={q > 0 ? "text-purple font-bold" : "text-orange font-bold"}>{q > 0 ? `+${q}` : q}</span>
                                        <span className="text-ink/70">{f.Note}</span>
                                        <span className="text-ink/50 text-xs">{fmtDate(f.CreatedAt)}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </section>
            )}

            {activeTab === "users" && admin && (
                <section className="space-y-4">
                    <p className="text-sm text-ink/70">Change what each account can access. Admins can manage everything, staff can run orders, repairs and stock.</p>
                    {userRecords.map((u) => {
                        const f = u.fields as { Name?: string; Email?: string; Role?: string };
                        return (
                            <AdminUserRow
                                key={`${u.id}-${f.Role ?? ""}`}
                                id={u.id}
                                name={f.Name ?? ""}
                                email={f.Email ?? ""}
                                role={(f.Role ?? "customer").toLowerCase()}
                                isSelf={u.id === user.id}
                            />
                        );
                    })}
                </section>
            )}
        </div>
    );
}

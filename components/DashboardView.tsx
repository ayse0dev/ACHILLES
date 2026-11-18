import Link from "next/link";
import { base } from "@/lib/airtable";
import { getCurrentUser } from "@/lib/session";
import { isAdmin, isStaff } from "@/lib/roles";
import AdminRepairRow from "@/components/AdminRepairRow";
import AdminOrderRow from "@/components/AdminOrderRow";
import AdminStockRow from "@/components/AdminStockRow";
import AdminUserRow from "@/components/AdminUserRow";
import AdminTicketRow from "@/components/AdminTicketRow";
import CreateAccountForm from "@/components/CreateAccountForm";
import MoneyFlow from "@/components/MoneyFlow";
import TrendChart from "@/components/TrendChart";
import AutoRefresh from "@/components/AutoRefresh";
import AttendanceClock from "@/components/AttendanceClock";
import LiveInbox from "@/components/LiveInbox";
import { buildBuyers, buildDays } from "@/lib/analytics";
import { maskEmail } from "@/lib/audit";

const staffTabs = [
    { key: "overview", label: "Overview" },
    { key: "repairs", label: "Repairs" },
    { key: "orders", label: "Orders" },
    { key: "deliveries", label: "Deliveries" },
    { key: "stock", label: "Stock" },
    { key: "tickets", label: "Tickets" },
    { key: "chats", label: "Live chat" },
];

function fmtDate(value?: string) {
    return value ? new Date(value).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "";
}

export default async function DashboardView({ mode, tab = "overview" }: { mode: "admin" | "staff"; tab?: string }) {
    const user = await getCurrentUser();

    if (!user || !isStaff(user.role) || (mode === "admin" && !isAdmin(user.role))) {
        return (
            <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
                <p className="eyebrow">{mode === "admin" ? "Admin" : "Staff"}</p>
                <h1 className="page-title">Not authorized</h1>
                <p className="text-ink/70">This dashboard is for ACHILLES {mode === "admin" ? "admins" : "staff and admins"} only.</p>
            </div>
        );
    }

    const admin = mode === "admin";
    const shownEmail = (e: string) => (admin ? e : maskEmail(e));
    const tabs = admin
        ? [
              ...staffTabs,
              { key: "analytics", label: "Analytics" },
              { key: "buyers", label: "Buyers" },
              { key: "staff", label: "Staff" },
              { key: "users", label: "Users" },
          ]
        : staffTabs;
    const activeTab = tabs.some((t) => t.key === tab) ? tab : "overview";

    const [repairRecords, orderRecords, productRecords, intakeRecords, userRecords, attendanceRecords, ticketRecords] = await Promise.all([
        base("RepairRequests").select({ sort: [{ field: "SubmittedAt", direction: "desc" }], maxRecords: 100 }).firstPage(),
        base("Orders").select({ sort: [{ field: "CreatedAt", direction: "desc" }], maxRecords: 100 }).firstPage(),
        base("Products").select({ sort: [{ field: "Name", direction: "asc" }], maxRecords: 100 }).firstPage(),
        base("StockIntakes").select({ sort: [{ field: "CreatedAt", direction: "desc" }], maxRecords: 30 }).firstPage().catch(() => []),
        admin ? base("Users").select({ sort: [{ field: "Email", direction: "asc" }], maxRecords: 200 }).firstPage() : Promise.resolve([]),
        base("Attendance").select({ sort: [{ field: "Date", direction: "desc" }], maxRecords: 100 }).firstPage().catch(() => []),
        base("Tickets").select({ sort: [{ field: "CreatedAt", direction: "desc" }], maxRecords: 100 }).firstPage().catch(() => []),
    ]);

    const orderRows = orderRecords.map((o) => {
        const f = o.fields as { Email?: string; Total?: number; CreatedAt?: string };
        return { email: f.Email ?? "", total: Number(f.Total ?? 0), date: f.CreatedAt };
    });
    const repairRows = repairRecords
        .map((r) => r.fields as { Status?: string; Quote?: number; SubmittedAt?: string })
        .filter((f) => f.Status === "Completed")
        .map((f) => ({ total: Number(f.Quote ?? 0), date: f.SubmittedAt }));
    const shopTotal = orderRows.reduce((s, o) => s + o.total, 0);
    const repairTotal = repairRows.reduce((s, r) => s + r.total, 0);
    const days = buildDays(orderRows, repairRows);
    const buyers = buildBuyers(orderRows);

    const openRepairs = repairRecords.filter((r) => (r.fields as { Status?: string }).Status !== "Completed").length;
    const lowStock = productRecords.filter((p) => Number((p.fields as { Stock?: number }).Stock ?? 0) <= 3);
    const toShip = orderRecords.filter((o) => ["Paid", "Packed"].includes(String((o.fields as { Status?: string }).Status)));
    const deliveries = orderRecords.filter((o) => ["Packed", "Shipped", "Delivered"].includes(String((o.fields as { Status?: string }).Status)));

    const openTickets = ticketRecords.filter((t) => (t.fields as { Status?: string }).Status !== "Resolved").length;
    const count = (rows: readonly { fields: object }[], key: string, values: string[]) =>
        rows.filter((r) => values.includes(String((r.fields as Record<string, unknown>)[key]))).length;
    const goals = [
        { label: "Orders delivered", done: count(orderRecords, "Status", ["Delivered"]), total: orderRecords.length, color: "bg-ink" },
        { label: "Repairs completed", done: count(repairRecords, "Status", ["Completed"]), total: repairRecords.length, color: "bg-ink" },
        { label: "Tickets resolved", done: count(ticketRecords, "Status", ["Resolved"]), total: ticketRecords.length, color: "bg-ink" },
        { label: "Products well stocked", done: productRecords.length - lowStock.length, total: productRecords.length, color: "bg-ink" },
    ];

    return (
        <div className="admin-ui min-h-[calc(100vh-4rem)] bg-[#f6f7f9]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 grid lg:grid-cols-[210px_1fr] gap-8 items-start">
            <AutoRefresh seconds={20} />
            <aside className="bg-white border border-ink/10 rounded-lg p-3 lg:sticky lg:top-24 space-y-3">
                <div className="px-2 pt-1 pb-3 border-b border-ink/10">
                    <p className="text-sm font-semibold">{admin ? "Admin" : "Staff"}</p>
                    <p className="text-xs text-ink/60 truncate">{user.email}</p>
                </div>
                <nav className="flex lg:flex-col gap-0.5 overflow-x-auto">
                    {tabs.map((t) => (
                        <Link
                            key={t.key}
                            href={`/${mode}?tab=${t.key}`}
                            className={`px-3 py-2 rounded-md text-sm whitespace-nowrap transition ${
                                activeTab === t.key ? "bg-ink text-white font-medium" : "text-ink/70 hover:bg-ink/5"
                            }`}
                            aria-current={activeTab === t.key ? "page" : undefined}
                        >
                            {t.label}
                        </Link>
                    ))}
                </nav>
            </aside>

            <div className="space-y-6 min-w-0">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">{tabs.find((t) => t.key === activeTab)?.label}</h1>
                <p className="text-xs text-ink/50">Refreshes automatically every 20 seconds.</p>
            </div>

            {activeTab === "overview" && (
                <section className="space-y-6">
                    <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
                        {[
                            { value: `₱${(shopTotal + repairTotal).toLocaleString("en-US", { maximumFractionDigits: 0 })}`, label: "Total money in" },
                            { value: String(openRepairs), label: "Open repairs" },
                            { value: String(toShip.length), label: "Orders to pack or ship" },
                            { value: String(openTickets), label: "Open tickets" },
                        ].map((s) => (
                            <div key={s.label} className="card p-5">
                                <p className="text-xs text-ink/60">{s.label}</p>
                                <p className="text-2xl font-semibold mt-1 truncate">{s.value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid xl:grid-cols-[2fr_1fr] gap-4">
                        <div className="card p-6 space-y-3">
                            <h2 className="font-semibold text-sm">Money in, last 14 days</h2>
                            <TrendChart days={days} />
                        </div>
                        <div className="card p-6 space-y-4">
                            <h2 className="font-semibold text-sm">Goal completion</h2>
                            {goals.map((g) => (
                                <div key={g.label} className="space-y-1">
                                    <div className="flex justify-between text-xs font-bold"><span>{g.label}</span><span>{g.done}/{g.total}</span></div>
                                    <div className="h-1.5 rounded-sm bg-ink/10 overflow-hidden">
                                        <div className={`h-full ${g.color}`} style={{ width: `${g.total ? Math.round((g.done / g.total) * 100) : 0}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <AttendanceClock />

                    <div className="grid lg:grid-cols-3 gap-4">
                        <div className="card p-5 space-y-3">
                            <h2 className="font-semibold text-sm">Recent orders</h2>
                            {orderRecords.slice(0, 5).map((o) => {
                                const f = o.fields as { Reference?: string; Email?: string; Total?: number; Status?: string };
                                return (
                                    <div key={o.id} className="flex justify-between gap-2 text-sm border-t border-ink/10 pt-2">
                                        <span className="truncate"><b>{f.Reference ?? "OR"}</b> {f.Email}</span>
                                        <span className="shrink-0 font-bold">₱{Number(f.Total ?? 0).toFixed(0)} · {f.Status}</span>
                                    </div>
                                );
                            })}
                            {orderRecords.length === 0 && <p className="text-sm text-ink/60">No orders yet.</p>}
                        </div>
                        <div className="card p-5 space-y-3">
                            <h2 className="font-semibold text-sm">Recent repairs</h2>
                            {repairRecords.slice(0, 5).map((r) => {
                                const f = r.fields as { Reference?: string; ShoeDescription?: string; Status?: string };
                                return (
                                    <div key={r.id} className="flex justify-between gap-2 text-sm border-t border-ink/10 pt-2">
                                        <span className="truncate"><b>{f.Reference ?? "RP"}</b> {f.ShoeDescription}</span>
                                        <span className="shrink-0 font-bold">{f.Status}</span>
                                    </div>
                                );
                            })}
                            {repairRecords.length === 0 && <p className="text-sm text-ink/60">No repairs yet.</p>}
                        </div>
                        <div className="card p-5 space-y-3">
                            <h2 className="font-semibold text-sm">Low stock</h2>
                            {lowStock.length === 0 ? (
                                <p className="text-ink/60 text-sm">Nothing is running low.</p>
                            ) : (
                                lowStock.slice(0, 6).map((p) => (
                                    <div key={p.id} className="flex justify-between gap-2 text-sm border-t border-ink/10 pt-2">
                                        <span className="truncate">{String((p.fields as { Name?: string }).Name)}</span>
                                        <span className="shrink-0 font-bold text-orange">{Number((p.fields as { Stock?: number }).Stock ?? 0)} left</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>
            )}

            {activeTab === "repairs" && (
                <section className="space-y-4">
                    {repairRecords.length === 0 && <p className="text-ink/60">No repair requests yet.</p>}
                    {repairRecords.map((r) => {
                        const f = r.fields as { Name?: string; Email?: string; ShoeDescription?: string; Issue?: string; Status?: string; Quote?: number; SubmittedAt?: string; Photo?: string };
                        return (
                            <AdminRepairRow
                                key={`${r.id}-${f.Status}-${f.Quote ?? ""}`}
                                id={r.id}
                                name={f.Name ?? ""}
                                email={shownEmail(f.Email ?? "")}
                                shoe={f.ShoeDescription ?? ""}
                                issue={f.Issue ?? ""}
                                status={f.Status ?? "Pending"}
                                quote={f.Quote}
                                submitted={fmtDate(f.SubmittedAt)}
                                hasPhoto={!!f.Photo}
                            />
                        );
                    })}
                </section>
            )}

            {activeTab === "orders" && (
                <section className="space-y-4">
                    {orderRecords.length === 0 && <p className="text-ink/60">No orders yet.</p>}
                    {orderRecords.map((o) => {
                        const f = o.fields as { Email?: string; Items?: string; Total?: number; Status?: string; Tracking?: string; CreatedAt?: string; Address?: string; Phone?: string; PaymentMethod?: string; Voucher?: string; Lat?: number; Lng?: number };
                        return (
                            <AdminOrderRow
                                key={`${o.id}-${f.Status}-${f.Tracking ?? ""}`}
                                id={o.id}
                                email={shownEmail(f.Email ?? "")}
                                items={f.Items ?? ""}
                                total={f.Total ?? 0}
                                status={f.Status ?? "Paid"}
                                tracking={f.Tracking ?? ""}
                                created={fmtDate(f.CreatedAt)}
                                address={f.Address}
                                phone={f.Phone}
                                payment={f.PaymentMethod}
                                voucher={f.Voucher}
                                lat={f.Lat}
                                lng={f.Lng}
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
                        const f = o.fields as { Email?: string; Items?: string; Total?: number; Status?: string; Tracking?: string; CreatedAt?: string; Address?: string; Phone?: string; PaymentMethod?: string; Voucher?: string; Lat?: number; Lng?: number };
                        return (
                            <AdminOrderRow
                                key={`${o.id}-${f.Status}-${f.Tracking ?? ""}`}
                                id={o.id}
                                email={shownEmail(f.Email ?? "")}
                                items={f.Items ?? ""}
                                total={f.Total ?? 0}
                                status={f.Status ?? "Packed"}
                                tracking={f.Tracking ?? ""}
                                created={fmtDate(f.CreatedAt)}
                                address={f.Address}
                                phone={f.Phone}
                                payment={f.PaymentMethod}
                                voucher={f.Voucher}
                                lat={f.Lat}
                                lng={f.Lng}
                            />
                        );
                    })}
                </section>
            )}

            {activeTab === "stock" && (
                <section className="space-y-8">
                    <div className="space-y-4">
                        <h2 className="font-semibold text-base">Current stock</h2>
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
                        <h2 className="font-semibold text-base">Stock-in history</h2>
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

            {activeTab === "chats" && <LiveInbox />}

            {activeTab === "tickets" && (
                <section className="space-y-4">
                    {ticketRecords.length === 0 && <p className="text-ink/60">No tickets yet.</p>}
                    {ticketRecords.map((t) => {
                        const f = t.fields as { Reference?: string; Email?: string; Subject?: string; Message?: string; Status?: string; Reply?: string; CreatedAt?: string };
                        return (
                            <AdminTicketRow
                                key={`${t.id}-${f.Status}-${f.Reply ?? ""}`}
                                id={t.id}
                                reference={f.Reference ?? ""}
                                email={shownEmail(f.Email ?? "")}
                                subject={f.Subject ?? ""}
                                message={f.Message ?? ""}
                                status={f.Status ?? "Open"}
                                reply={f.Reply ?? ""}
                                created={fmtDate(f.CreatedAt)}
                            />
                        );
                    })}
                </section>
            )}

            {activeTab === "analytics" && admin && (
                <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MoneyFlow days={days} shopTotal={shopTotal} repairTotal={repairTotal} />
                    <div className="card p-6"><p className="text-xs text-ink/60">Average order</p><p className="text-2xl font-semibold">₱{(orderRows.length ? shopTotal / orderRows.length : 0).toFixed(2)}</p></div>
                    <div className="card p-6"><p className="text-xs text-ink/60">Buyers</p><p className="text-2xl font-semibold">{buyers.length}</p></div>
                    <div className="card p-6"><p className="text-xs text-ink/60">Repair requests</p><p className="text-2xl font-semibold">{repairRecords.length}</p></div>
                    <div className="card p-6"><p className="text-xs text-ink/60">Completed repairs</p><p className="text-2xl font-semibold">{repairRows.length}</p></div>
                </section>
            )}

            {activeTab === "buyers" && admin && (
                <section className="space-y-3">
                    <p className="text-sm text-ink/70">Buyers ranked by total spend and split into Rising, Middle and Low thirds.</p>
                    {buyers.length === 0 && <p className="text-ink/60">No buyers yet.</p>}
                    <ul className="card divide-y divide-ink/10">
                        {buyers.map((b) => (
                            <li key={b.email} className="p-4 flex flex-wrap justify-between gap-2 text-sm">
                                <span className="font-bold">{shownEmail(b.email)}</span>
                                <span>{b.orders} orders</span>
                                <span className="font-semibold">₱{b.spent.toFixed(2)}</span>
                                <span className="text-xs px-2 py-0.5 rounded bg-ink/5">{b.tier}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {activeTab === "staff" && admin && (
                <section className="space-y-3">
                    <p className="text-sm text-ink/70">Staff attendance, most recent first.</p>
                    {attendanceRecords.length === 0 && <p className="text-ink/60">No attendance logged yet.</p>}
                    <ul className="card divide-y divide-ink/10">
                        {attendanceRecords.map((a) => {
                            const f = a.fields as { Name?: string; Email?: string; Date?: string; ClockIn?: string; ClockOut?: string };
                            return (
                                <li key={a.id} className="p-4 flex flex-wrap justify-between gap-2 text-sm">
                                    <span className="font-bold">{f.Name ?? f.Email}</span>
                                    <span>{f.Date}</span>
                                    <span>In {f.ClockIn ? new Date(f.ClockIn).toLocaleTimeString("en-US", { timeStyle: "short" }) : "-"}</span>
                                    <span>Out {f.ClockOut ? new Date(f.ClockOut).toLocaleTimeString("en-US", { timeStyle: "short" }) : "-"}</span>
                                </li>
                            );
                        })}
                    </ul>
                </section>
            )}

            {activeTab === "users" && admin && (
                <section className="space-y-4">
                    <h2 className="font-semibold text-sm">Create a staff account</h2>
                    <CreateAccountForm />
                    <p className="text-sm text-ink/70">Change what each account can access. Admins can manage everything, staff can run orders, repairs and stock.</p>
                    {(() => {
                        const roleOf = (u: { fields: object }) => String((u.fields as { Role?: string }).Role ?? "customer").toLowerCase();
                        const admins = userRecords.filter((u) => roleOf(u) === "admin");
                        const others = userRecords.filter((u) => roleOf(u) !== "admin");
                        const renderRow = (u: (typeof userRecords)[number]) => {
                            const f = u.fields as { Name?: string; Email?: string; Role?: string };
                            return (
                                <AdminUserRow
                                    key={`${u.id}-${f.Role ?? ""}`}
                                    id={u.id}
                                    name={f.Name ?? ""}
                                    email={shownEmail(f.Email ?? "")}
                                    role={(f.Role ?? "customer").toLowerCase()}
                                    isSelf={u.id === user.id}
                                />
                            );
                        };
                        return (
                            <>
                                {admins.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-medium text-ink/50">Administrators (permanent)</p>
                                        {admins.map(renderRow)}
                                    </div>
                                )}
                                {admins.length > 0 && others.length > 0 && <hr className="border-ink/15" />}
                                {others.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-medium text-ink/50">Staff and customers</p>
                                        {others.map(renderRow)}
                                    </div>
                                )}
                            </>
                        );
                    })()}
                </section>
            )}
            </div>
        </div>
        </div>
    );
}

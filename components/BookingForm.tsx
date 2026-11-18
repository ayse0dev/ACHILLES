"use client";

import Link from "next/link";
import { useActionState, useMemo, useRef, useState } from "react";
import Honeypot from "./Honeypot";
import { bookAppointment, BookState } from "@/app/book/actions";
import { repairGroups, serviceDetails } from "@/lib/business";
import { brands, checkIns, estimateFor, payments, peso, severities } from "@/lib/repairEstimate";

const initial: BookState = {};
const MAX_SIDE = 520;

const FONT = '"Inter", ui-sans-serif, system-ui, "Segoe UI", "Helvetica Neue", Arial, sans-serif';
const DARK = "linear-gradient(135deg, #5a5a5a 0%, #2b2b2b 55%, #1c1c1c 100%)";

function compress(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
            const canvas = document.createElement("canvas");
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            const ctx = canvas.getContext("2d");
            if (!ctx) {
                URL.revokeObjectURL(url);
                reject(new Error("no canvas"));
                return;
            }
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL("image/jpeg", 0.6));
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("bad image"));
        };
        img.src = url;
    });
}

const panel = "relative rounded-[28px] bg-white/85 backdrop-blur-md border border-white shadow-[0_10px_40px_rgba(0,0,0,0.07)] p-7 md:p-12 space-y-8";
const input =
    "w-full h-[68px] rounded-3xl bg-[#f6f5f3] border border-[#e2dfda] px-6 text-[18px] text-[#3d3d3d] placeholder:text-[#9a9a9a] outline-none focus:border-[#7a7a7a] focus:bg-white transition";
const selectCls = `${input} pr-10`;

function Step({ n, title, aside }: { n: string; title: string; aside?: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-4">
                <span className="w-11 h-11 rounded-full bg-[#7d7d7d] text-white text-[13px] font-bold font-mono flex items-center justify-center">{n}</span>
                <h2 className="uppercase tracking-[0.22em] text-[17px] font-bold text-[#6b6b6b]">{title}</h2>
            </div>
            {aside}
        </div>
    );
}

function Label({ children }: { children: React.ReactNode }) {
    return <label className="block text-[17px] font-semibold text-[#444] mb-3">{children}</label>;
}

function Bubbles() {
    const bubbles = [
        { l: "1%", t: "5%", s: 30 }, { l: "96%", t: "12%", s: 22 }, { l: "3%", t: "30%", s: 16 }, { l: "98%", t: "36%", s: 34 },
        { l: "2%", t: "55%", s: 24 }, { l: "97%", t: "62%", s: 18 }, { l: "3%", t: "80%", s: 30 }, { l: "96%", t: "90%", s: 20 },
    ];
    const splotches = [
        { l: "-4%", t: "2%", s: 260 }, { l: "88%", t: "20%", s: 300 }, { l: "-6%", t: "48%", s: 240 }, { l: "90%", t: "70%", s: 280 }, { l: "10%", t: "94%", s: 260 },
    ];
    return (
        <div className="pointer-events-none absolute -inset-x-16 -inset-y-10 overflow-hidden -z-0" aria-hidden="true">
            {splotches.map((b, i) => (
                <span
                    key={`s${i}`}
                    className="absolute rounded-full"
                    style={{ left: b.l, top: b.t, width: b.s, height: b.s, background: "radial-gradient(circle, rgba(120,100,85,0.28) 0%, rgba(120,100,85,0) 70%)", filter: "blur(14px)" }}
                />
            ))}
            {bubbles.map((b, i) => (
                <span
                    key={i}
                    className="absolute rounded-full"
                    style={{
                        left: b.l,
                        top: b.t,
                        width: b.s,
                        height: b.s,
                        background: "radial-gradient(circle at 30% 30%, #ffffff 0%, #ece9e5 55%, #d2cdc6 100%)",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                        opacity: 0.85,
                    }}
                />
            ))}
        </div>
    );
}

export default function BookingForm({
    signedIn,
    defaultName,
    defaultEmail,
    defaultPhone,
    presetService,
}: {
    signedIn: boolean;
    defaultName: string;
    defaultEmail: string;
    defaultPhone: string;
    presetService: string;
}) {
    const [state, action, pending] = useActionState(bookAppointment, initial);
    const allServices = useMemo(() => repairGroups.flatMap((g) => g.rows.map((r) => ({ ...r, group: g.title }))), []);

    const [name, setName] = useState(defaultName);
    const [email, setEmail] = useState(defaultEmail);
    const [phone, setPhone] = useState(defaultPhone || "+63");
    const [brand, setBrand] = useState(brands[0]);
    const [model, setModel] = useState("");
    const [group, setGroup] = useState("All");
    const [selected, setSelected] = useState<string[]>(allServices.some((s) => s.service === presetService) ? [presetService] : []);
    const [severity, setSeverity] = useState(severities[1]);
    const [description, setDescription] = useState("");
    const [photo, setPhoto] = useState("");
    const [photoError, setPhotoError] = useState("");
    const [checkIn, setCheckIn] = useState<(typeof checkIns)[number]>(checkIns[0]);
    const [date, setDate] = useState("");
    const [payment, setPayment] = useState<string>(payments[0].key);
    const fileRef = useRef<HTMLInputElement>(null);

    const estimate = estimateFor(selected.map((s) => allServices.find((x) => x.service === s)?.price ?? ""));
    const estimateText =
        selected.length === 0
            ? "—"
            : estimate.low === 0 && estimate.high === 0
              ? "Quote on inspection"
              : estimate.low === estimate.high
                ? peso(estimate.low)
                : `${peso(estimate.low)} – ${peso(estimate.high)}`;
    const paymentTitle = payments.find((p) => p.key === payment)?.tag ?? "";

    const visible = allServices.filter((s) => group === "All" || s.group === group);
    const toggle = (service: string) => setSelected((cur) => (cur.includes(service) ? cur.filter((s) => s !== service) : [...cur, service]));

    async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        setPhotoError("");
        if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 10 * 1024 * 1024) {
            setPhotoError("Choose a JPG, PNG or WebP photo under 10 MB.");
            return;
        }
        try {
            setPhoto(await compress(file));
        } catch {
            setPhotoError("We could not read that photo. Try another one.");
        }
    }

    const payload = JSON.stringify({
        name,
        email,
        phone,
        brand,
        model,
        services: selected,
        severity,
        description,
        checkIn,
        preferredDate: date || undefined,
        payment,
        photo: photo || undefined,
    });

    if (state.success) {
        return (
            <div className={`${panel} text-center max-w-xl mx-auto`} style={{ fontFamily: FONT }}>
                <p className="uppercase tracking-[0.22em] text-[12px] font-bold text-[#7d7d7d]">Booking received</p>
                <h2 className="text-3xl font-bold text-[#222]">Salamat! We&apos;ll be in touch</h2>
                <p className="text-[#555]">We sent a confirmation to your email. We confirm the final price after we inspect your shoes.</p>
                {state.reference && <p className="font-mono font-bold text-2xl tracking-widest text-[#222]">{state.reference}</p>}
                <p className="text-xs text-[#777]">Keep this reference to follow your repair.</p>
                <Link href="/track" className="inline-block rounded-full bg-[#1c1c1c] text-white font-semibold uppercase tracking-wider text-sm px-8 py-4">
                    Track your repair
                </Link>
            </div>
        );
    }

    return (
        <form action={action} className="relative space-y-8" style={{ fontFamily: FONT }}>
            <Bubbles />
            <Honeypot />
            <input type="hidden" name="payload" value={payload} />

            <section className={panel}>
                <Step
                    n="01"
                    title="Client contact information"
                    aside={
                        signedIn && (
                            <span className="text-[16px] rounded-full border border-[#e2dfda] bg-white px-5 py-2 text-[#555]">
                                Booking as <b className="text-[#111]">{defaultName || defaultEmail}</b>
                                {defaultName && defaultEmail ? ` (${defaultEmail})` : ""}
                            </span>
                        )
                    }
                />
                <div className="grid md:grid-cols-3 gap-6">
                    <div>
                        <Label>Full Name *</Label>
                        <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} className={input} />
                    </div>
                    <div>
                        <Label>Email Address *</Label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={120} className={input} />
                    </div>
                    <div>
                        <Label>Contact Phone *</Label>
                        <input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/[^\d+\s-]/g, "").slice(0, 16))}
                            inputMode="tel"
                            required
                            placeholder="+63 9xx xxx xxxx"
                            className={input}
                        />
                    </div>
                </div>
            </section>

            <section className={panel}>
                <Step n="02" title="Footwear details & desired service" />
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <Label>Brand *</Label>
                        <select value={brand} onChange={(e) => setBrand(e.target.value)} className={selectCls}>
                            {brands.map((b) => (
                                <option key={b}>{b}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <Label>Shoe Model &amp; Colorway *</Label>
                        <input value={model} onChange={(e) => setModel(e.target.value)} required minLength={2} maxLength={100} placeholder="e.g. Air Jordan 4 'Bred' (2019)" className={input} />
                    </div>
                </div>

                <div>
                    <Label>Select Treatment / Service *</Label>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {["All", ...repairGroups.map((g) => g.title)].map((g) => (
                            <button
                                key={g}
                                type="button"
                                onClick={() => setGroup(g)}
                                className={`rounded-full px-5 py-2 text-[15px] font-semibold border transition ${group === g ? "bg-[#2b2b2b] text-white border-[#2b2b2b]" : "bg-[#f5f5f5] text-[#555] border-[#e2e2e2] hover:border-[#9a9a9a]"}`}
                            >
                                {g}
                            </button>
                        ))}
                    </div>
                    <div className="grid lg:grid-cols-2 gap-5 max-h-[44rem] overflow-y-auto pr-2">
                        {visible.map((s) => {
                            const on = selected.includes(s.service);
                            return (
                                <button
                                    type="button"
                                    key={s.service}
                                    onClick={() => toggle(s.service)}
                                    aria-pressed={on}
                                    className={`text-left rounded-3xl border p-7 transition ${on ? "text-white border-transparent shadow-[0_12px_28px_rgba(0,0,0,0.25)]" : "bg-[#f7f7f7] border-[#e4e4e4] text-[#222] hover:border-[#b5b5b5]"}`}
                                    style={on ? { background: DARK } : undefined}
                                >
                                    <span className="flex items-start justify-between gap-3">
                                        <span className={`text-[15px] font-medium uppercase tracking-wide ${on ? "text-white/70" : "text-[#8a8a8a]"}`}>{s.group}</span>
                                        <span className="font-extrabold text-[20px] whitespace-nowrap">{s.price}</span>
                                    </span>
                                    <span className="block font-extrabold text-[24px] mt-3 leading-snug">{s.service}</span>
                                    <span className={`block text-[17px] mt-2 truncate ${on ? "text-white/85" : "text-[#666]"}`}>{serviceDetails[s.service]}</span>
                                    <span className={`block text-[15px] mt-6 ${on ? "text-white/70" : "text-[#8a8a8a]"}`}>Turnaround: {s.turnaround}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className={panel}>
                <Step n="03" title="Condition assessment & photo" />
                <div>
                    <Label>Wear / Damage Severity</Label>
                    <select value={severity} onChange={(e) => setSeverity(e.target.value)} className={selectCls}>
                        {severities.map((s) => (
                            <option key={s}>{s}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <Label>Condition Description &amp; Specific Areas of Concern *</Label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        minLength={5}
                        maxLength={1200}
                        rows={4}
                        placeholder="e.g. Mud stains on toe box, left midsole separated at the toe, yellowed translucent soles..."
                        className={`${input} h-auto py-4 resize-y`}
                    />
                </div>
                <div>
                    <Label>Optional Photo Upload</Label>
                    <div className="flex items-center gap-4 flex-wrap">
                        <button type="button" onClick={() => fileRef.current?.click()} className="rounded-full bg-[#2b2b2b] text-white text-[17px] font-semibold px-8 py-4">
                            {photo ? "Change File" : "Choose File"}
                        </button>
                        {photo ? (
                            <span className="flex items-center gap-3">
                                <img src={photo} alt="Your shoe" className="w-14 h-14 rounded-xl object-cover border border-[#ddd]" />
                                <button type="button" onClick={() => setPhoto("")} className="text-xs underline text-[#555]">Remove</button>
                            </span>
                        ) : (
                            <span className="text-[17px] text-[#666]">No file chosen</span>
                        )}
                        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onPhoto} className="hidden" />
                    </div>
                    {photoError && <p className="text-red text-xs mt-2">{photoError}</p>}
                </div>
            </section>

            <section className={panel}>
                <Step n="04" title="Preferred check-in method" />
                <div className="grid sm:grid-cols-3 gap-5">
                    {checkIns.map((c) => (
                        <button
                            type="button"
                            key={c}
                            onClick={() => setCheckIn(c)}
                            aria-pressed={checkIn === c}
                            className={`rounded-3xl border py-7 px-4 text-[20px] font-semibold transition ${checkIn === c ? "text-white border-transparent shadow-[0_10px_24px_rgba(0,0,0,0.22)]" : "bg-[#f7f7f7] border-[#e4e4e4] text-[#666] hover:border-[#b5b5b5]"}`}
                            style={checkIn === c ? { background: DARK } : undefined}
                        >
                            {c}
                        </button>
                    ))}
                </div>
                {checkIn !== "Courier Mail-in" ? (
                    <div className="max-w-xs">
                        <Label>Preferred date (optional)</Label>
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={input} />
                    </div>
                ) : (
                    <p className="text-[13px] text-[#666]">We send shipping instructions after we review your booking. You cover shipping both ways.</p>
                )}
            </section>

            <section className={panel}>
                <Step
                    n="05"
                    title="Paraan ng pagbabayad (payment process)"
                    aside={
                        <span className="text-[14px] font-bold uppercase tracking-wide text-[#0f9d58] bg-[#e7f8ee] border border-[#bfe9d0] rounded-full px-4 py-1.5">
                            Walang bayad ngayon
                        </span>
                    }
                />
                <p className="text-[18px] text-[#666]">Pumili kung paano mo gustong bayaran ang serbisyo o restoration fee.</p>
                <div className="grid md:grid-cols-3 gap-5">
                    {payments.map((p) => {
                        const on = payment === p.key;
                        const icon = p.key === "cod" ? "💵" : p.key === "ewallet" ? "📱" : "💳";
                        return (
                            <button
                                type="button"
                                key={p.key}
                                onClick={() => setPayment(p.key)}
                                aria-pressed={on}
                                className={`text-left rounded-3xl border p-7 flex flex-col gap-4 transition ${on ? "text-white border-transparent shadow-[0_12px_28px_rgba(0,0,0,0.25)]" : "bg-[#f7f7f7] border-[#e4e4e4] text-[#222] hover:border-[#b5b5b5]"}`}
                                style={on ? { background: DARK } : undefined}
                            >
                                <span className="flex items-center justify-between">
                                    <span className="text-3xl" aria-hidden="true">{icon}</span>
                                    <span className={`text-[13px] font-bold uppercase tracking-wide rounded-full px-4 py-1.5 ${on ? "bg-white/90 text-[#222]" : "bg-[#e6e6e6] text-[#666]"}`}>{p.tag}</span>
                                </span>
                                <span className="font-extrabold text-[20px] leading-snug">{p.title}</span>
                                <span className={`text-[17px] leading-relaxed ${on ? "text-white/85" : "text-[#666]"}`}>{p.text}</span>
                                <span className={`text-[15px] border-t pt-4 mt-auto ${on ? "border-white/20 text-white/85" : "border-[#e4e4e4] text-[#777]"}`}>✓ {p.foot}</span>
                            </button>
                        );
                    })}
                </div>
            </section>

            <label className="flex items-start gap-2 text-[13px] text-[#666] px-2">
                <input type="checkbox" name="consent" required className="mt-0.5" />
                <span>
                    I agree to the <a href="/privacy" target="_blank" className="underline">Privacy Policy</a> and consent to ACHILLES processing my details.
                </span>
            </label>

            <div className="rounded-[32px] bg-[#1b1b1b] text-white p-8 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_16px_40px_rgba(0,0,0,0.25)]">
                <div>
                    <p className="text-[16px] font-semibold uppercase tracking-[0.15em] text-white/60">Tinatayang halaga</p>
                    <p className="text-5xl md:text-6xl font-extrabold mt-2">{estimateText}</p>
                    <p className="text-[18px] text-white/60 mt-3">Payment settled via {paymentTitle}. Final price after inspection.</p>
                </div>
                <div className="space-y-2 md:text-right">
                    {state.error && <p className="text-sm text-[#ff9aa8]">{state.error}</p>}
                    <button
                        disabled={pending || selected.length === 0}
                        className="rounded-full bg-[#ececec] text-[#1b1b1b] font-semibold uppercase tracking-[0.14em] text-[17px] px-12 py-7 hover:bg-white transition disabled:opacity-50"
                    >
                        {pending ? "Sinusumite..." : "Kumpirmahin at i-submit ang booking"}
                    </button>
                    {selected.length === 0 && <p className="text-xs text-white/50">Pumili muna ng kahit isang serbisyo.</p>}
                </div>
            </div>
        </form>
    );
}

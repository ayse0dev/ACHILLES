"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "./CartProvider";
import AddressFields, { AddressDraft, draftComplete, emptyDraft } from "./AddressFields";
import PhoneInput from "./PhoneInput";
import { addressLine, type Address } from "@/lib/addressTypes";

type Payment = "online" | "banking" | "bank_transfer" | "cod";

const PAYMENTS: { key: Payment; title: string; text: string }[] = [
    { key: "online", title: "GCash, Maya, card or online banking", text: "Pay securely online. You choose your method on the next page." },
    { key: "bank_transfer", title: "Bank transfer", text: "Send the amount to our bank account. We pack once confirmed." },
    { key: "cod", title: "Cash on delivery", text: "Pay in cash when it arrives. We call or message you to confirm first. First orders up to ₱3,000, otherwise up to ₱20,000." },
];

export default function CheckoutForm({
    profilePhone,
    addresses,
    bankReady,
}: {
    profilePhone: string;
    addresses: Address[];
    bankReady: boolean;
}) {
    const { items, subtotal } = useCart();
    const home = addresses.find((a) => a.home) ?? null;
    const saved = addresses.filter((a) => !a.home);

    const [addrChoice, setAddrChoice] = useState<string>(home ? "home" : saved[0] ? saved[0].id : "new");
    const [draft, setDraft] = useState<AddressDraft>(emptyDraft);
    const [saveNew, setSaveNew] = useState(true);

    const [sameNumber, setSameNumber] = useState(!!profilePhone);
    const [phone, setPhone] = useState("");

    const [payment, setPayment] = useState<Payment>("online");
    const [discount, setDiscount] = useState("none");
    const [idNumber, setIdNumber] = useState("");

    const [voucherInput, setVoucherInput] = useState("");
    const [voucher, setVoucher] = useState<{ code: string; off: number } | null>(null);
    const [voucherMsg, setVoucherMsg] = useState("");

    const [pending, setPending] = useState(false);
    const [error, setError] = useState("");

    const rate = discount === "none" ? 1 : 0.8;
    const afterId = useMemo(() => subtotal * rate, [subtotal, rate]);
    const total = Math.max(0, afterId - (voucher?.off ?? 0));

    const chosen = addrChoice === "home" ? home : addresses.find((a) => a.id === addrChoice) ?? null;
    const usingNew = addrChoice === "new";
    const phoneValue = sameNumber && profilePhone ? profilePhone : `+63${phone.replace(/\D/g, "").replace(/^0/, "")}`;

    async function applyVoucher() {
        setVoucherMsg("");
        try {
            const res = await fetch("/api/voucher", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: voucherInput, subtotal: afterId }),
            });
            const data = await res.json();
            if (!res.ok) {
                setVoucher(null);
                setVoucherMsg(data.error ?? "Voucher could not be applied.");
                return;
            }
            setVoucher({ code: data.code, off: data.off });
            setVoucherMsg(`Voucher ${data.code} applied: −₱${Number(data.off).toFixed(2)}`);
        } catch {
            setVoucherMsg("Voucher could not be applied.");
        }
    }

    function changeDiscount(value: string) {
        setDiscount(value);
        setVoucher(null);
        setVoucherMsg("");
    }

    async function placeOrder() {
        setError("");
        if (!usingNew && !chosen) {
            setError("Choose a delivery address.");
            return;
        }
        if (usingNew && !draftComplete(draft)) {
            setError("Complete the region, municipality, barangay and street.");
            return;
        }
        setPending(true);
        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: items.map((i) => ({ slug: i.slug, size: i.size, qty: i.qty })),
                    discount,
                    idNumber,
                    phone: phoneValue,
                    payment,
                    voucher: voucher?.code,
                    ...(usingNew
                        ? {
                              newAddress: {
                                  label: draft.label,
                                  region: draft.region,
                                  municipality: draft.municipality,
                                  barangay: draft.barangay,
                                  street: draft.street,
                                  lat: draft.lat,
                                  lng: draft.lng,
                              },
                              saveAddress: saveNew,
                          }
                        : { addressId: chosen?.id }),
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error ?? "Checkout failed. Please try again.");
                return;
            }
            window.location.assign(data.url ?? data.redirect);
        } catch {
            setError("Checkout failed. Please try again.");
        } finally {
            setPending(false);
        }
    }

    if (items.length === 0) {
        return (
            <div className="card p-8 text-center space-y-4">
                <p>Your cart is empty.</p>
                <Link href="/shop" className="btn btn-ink">Browse shoes</Link>
            </div>
        );
    }

    return (
        <div className="grid lg:grid-cols-[1fr_400px] items-start [&_.card]:!rounded-none [&_.card]:!shadow-none [&_.card]:!border-0 [&_.card]:!bg-transparent [&_.card]:!p-8">
            <div>
            <section className="card p-6 space-y-4">
                <h2 className="font-display font-bold text-xl">1. Delivery address <span className="text-red text-sm">required</span></h2>
                {home && (
                    <label className="flex gap-3 items-start text-sm">
                        <input type="radio" name="addr" checked={addrChoice === "home"} onChange={() => setAddrChoice("home")} className="mt-1" />
                        <span>
                            <b>Same as my home address</b>
                            <br />
                            {addressLine(home)}
                        </span>
                    </label>
                )}
                {saved.map((a) => (
                    <label key={a.id} className="flex gap-3 items-start text-sm">
                        <input type="radio" name="addr" checked={addrChoice === a.id} onChange={() => setAddrChoice(a.id)} className="mt-1" />
                        <span>
                            <b>{a.label || "Saved drop-off"}</b>
                            <br />
                            {addressLine(a)}
                        </span>
                    </label>
                ))}
                <label className="flex gap-3 items-start text-sm">
                    <input type="radio" name="addr" checked={usingNew} onChange={() => setAddrChoice("new")} className="mt-1" />
                    <b>Deliver to a different address</b>
                </label>
                {usingNew && (
                    <div className="space-y-3 pl-6">
                        <AddressFields value={draft} onChange={setDraft} withLabel />
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={saveNew} onChange={(e) => setSaveNew(e.target.checked)} />
                            Save as a drop-off location
                        </label>
                    </div>
                )}
            </section>

            <section className="card p-6 space-y-3">
                <h2 className="font-display font-bold text-xl">2. Contact number <span className="text-red text-sm">required</span></h2>
                {profilePhone && (
                    <>
                        <label className="flex gap-3 items-start text-sm">
                            <input type="radio" name="contact" checked={sameNumber} onChange={() => setSameNumber(true)} className="mt-1" />
                            <b>Same as my profile number ({profilePhone})</b>
                        </label>
                        <label className="flex gap-3 items-start text-sm">
                            <input type="radio" name="contact" checked={!sameNumber} onChange={() => setSameNumber(false)} className="mt-1" />
                            <b>Use a different number</b>
                        </label>
                    </>
                )}
                {!(sameNumber && profilePhone) && (
                    <div className={profilePhone ? "pl-6" : ""}>
                        <PhoneInput value={phone} onChange={setPhone} />
                    </div>
                )}
                {!profilePhone && (
                    <p className="text-xs text-ink/60">Tip: save a number in <Link href="/profile" className="underline">Profile management</Link> to reuse it next time.</p>
                )}
            </section>

            <section className="card p-6 space-y-3">
                <h2 className="font-display font-bold text-xl">3. Payment</h2>
                {PAYMENTS.filter((p) => p.key !== "bank_transfer" || bankReady).map((p) => (
                    <label key={p.key} className="flex gap-3 items-start text-sm">
                        <input type="radio" name="pay" checked={payment === p.key} onChange={() => setPayment(p.key)} className="mt-1" />
                        <span>
                            <b>{p.title}</b>
                            <br />
                            <span className="text-ink/60">{p.text}</span>
                        </span>
                    </label>
                ))}
                <p className="text-xs text-ink/60">You do not need to link a bank or e-wallet to your account. Online payments are handled securely at checkout.</p>
            </section>

            <section className="card p-6 space-y-3">
                <h2 className="font-display font-bold text-xl">4. Discounts <span className="text-xs font-normal text-ink/60">(optional)</span></h2>
                <select value={discount} onChange={(e) => changeDiscount(e.target.value)} className="field !py-2">
                    <option value="none">No ID discount</option>
                    <option value="student">Student (20%)</option>
                    <option value="senior">Senior citizen (20%)</option>
                    <option value="pwd">PWD (20%)</option>
                </select>
                {discount !== "none" && (
                    <>
                        <input value={idNumber} onChange={(e) => setIdNumber(e.target.value)} placeholder="ID number" className="field !py-2" />
                        <p className="text-xs text-ink/60">Show this ID on delivery. Orders with an invalid ID may be repriced.</p>
                    </>
                )}
                <div className="flex gap-2">
                    <input value={voucherInput} onChange={(e) => setVoucherInput(e.target.value.toUpperCase())} placeholder="Voucher code" maxLength={30} className="field !py-2 flex-1" />
                    <button type="button" onClick={applyVoucher} disabled={!voucherInput.trim()} className="btn btn-ink !py-2 !px-4 text-sm disabled:opacity-50">Apply</button>
                </div>
                {voucherMsg && <p className={`text-xs font-bold ${voucher ? "text-teal" : "text-red"}`}>{voucherMsg}</p>}
            </section>

            </div>

            <aside className="card p-6 space-y-4 lg:sticky lg:top-4">
                <h2 className="font-display font-bold text-xl">Your items</h2>
                <ul className="space-y-3">
                    {items.map((i) => (
                        <li key={`${i.slug}-${i.size}`} className="flex gap-3 items-center text-sm">
                            {i.image && <img src={i.image} alt="" className="w-14 h-14 rounded-xl object-cover bg-ink/5" />}
                            <span className="flex-1">
                                <b>{i.name}</b>
                                <br />
                                <span className="text-ink/60">Size {i.size} · Qty {i.qty}</span>
                            </span>
                            <span className="font-bold">₱{(i.price * i.qty).toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
                <div className="flex justify-between text-sm pt-2"><span>Subtotal</span><span>₱{subtotal.toFixed(2)}</span></div>
                {discount !== "none" && <div className="flex justify-between text-sm"><span>ID discount (20%)</span><span>−₱{(subtotal - afterId).toFixed(2)}</span></div>}
                {voucher && <div className="flex justify-between text-sm"><span>Voucher {voucher.code}</span><span>−₱{voucher.off.toFixed(2)}</span></div>}
                <div className="flex justify-between font-black text-2xl text-purple"><span>Total</span><span>₱{total.toFixed(2)}</span></div>
                {error && <p className="text-red text-sm">{error}</p>}
                <button onClick={placeOrder} disabled={pending} className="btn btn-accent w-full">
                    {pending ? "Please wait..." : payment === "cod" || payment === "bank_transfer" ? "Place order" : "Continue to payment"}
                </button>
            </aside>
        </div>
    );
}

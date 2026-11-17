"use client";

import { useActionState, useState, useTransition } from "react";
import AddressFields, { AddressDraft, draftComplete, emptyDraft } from "./AddressFields";
import PhoneInput from "./PhoneInput";
import { deleteAddress, DeliveryState, makeHome, saveAddress, saveBank, savePhone } from "@/app/account/delivery";
import { addressLine, type Address } from "@/lib/addressTypes";

const initial: DeliveryState = {};

function PhoneSection({ phone }: { phone: string }) {
    const [state, action, pending] = useActionState(savePhone, initial);
    const [value, setValue] = useState(phone.replace(/^\+63/, ""));
    return (
        <form action={action} className="card p-6 space-y-3">
            <h2 className="font-display font-bold text-xl">Phone number</h2>
            <PhoneInput name="phone" value={value} onChange={setValue} />
            {state.error && <p className="text-red text-sm">{state.error}</p>}
            {state.success && <p className="text-teal text-sm font-bold">Saved.</p>}
            <button disabled={pending} className="btn btn-ink">{pending ? "Saving..." : "Save number"}</button>
        </form>
    );
}

function BankSection({ bank, holder, last4 }: { bank: string; holder: string; last4: string }) {
    const [state, action, pending] = useActionState(saveBank, initial);
    return (
        <form action={action} className="card p-6 space-y-3">
            <h2 className="font-display font-bold text-xl">Linked bank account <span className="text-xs font-normal text-ink/60">(optional)</span></h2>
            <p className="text-xs text-ink/60">Used for refunds and quick bank payments. We only keep the bank, the holder name and the last 4 digits. Never type your full account number or PIN.</p>
            {bank && <p className="text-sm font-bold">Linked: {bank} ••••{last4} ({holder})</p>}
            <input name="bank" defaultValue={bank} placeholder="Bank (e.g. BDO, BPI, UnionBank)" className="field !py-2" />
            <input name="holder" defaultValue={holder} placeholder="Account holder name" className="field !py-2" />
            <input name="last4" defaultValue={last4} placeholder="Last 4 digits" maxLength={4} inputMode="numeric" className="field !py-2" />
            {state.error && <p className="text-red text-sm">{state.error}</p>}
            {state.success && <p className="text-teal text-sm font-bold">Saved.</p>}
            <div className="flex gap-3">
                <button disabled={pending} className="btn btn-ink">{pending ? "Saving..." : "Link bank"}</button>
                {bank && <button name="remove" value="1" disabled={pending} className="btn btn-ghost text-sm">Unlink</button>}
            </div>
        </form>
    );
}

function AddressSection({ addresses }: { addresses: Address[] }) {
    const [state, action, pending] = useActionState(saveAddress, initial);
    const [draft, setDraft] = useState<AddressDraft>(emptyDraft);
    const [adding, setAdding] = useState(false);
    const [busy, startTransition] = useTransition();

    const payload = JSON.stringify({
        label: draft.label,
        region: draft.region,
        municipality: draft.municipality,
        barangay: draft.barangay,
        street: draft.street,
        lat: draft.lat,
        lng: draft.lng,
    });

    return (
        <div className="card p-6 space-y-4">
            <h2 className="font-display font-bold text-xl">Home address & saved drop-off locations</h2>
            {addresses.length === 0 && <p className="text-sm text-ink/60">No saved addresses yet.</p>}
            <ul className="space-y-3">
                {addresses.map((a) => (
                    <li key={a.id} className="rounded-2xl border-2 border-ink/15 p-3 text-sm space-y-1">
                        <p className="font-bold">
                            {a.home ? "Home" : a.label || "Drop-off"}
                            {a.home && <span className="ml-2 text-[10px] uppercase bg-teal/30 rounded-full px-2 py-0.5">Default</span>}
                        </p>
                        <p>{addressLine(a)}</p>
                        {a.lat !== null && a.lng !== null && (
                            <a
                                href={`https://www.openstreetmap.org/?mlat=${a.lat}&mlon=${a.lng}#map=17/${a.lat}/${a.lng}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs underline"
                            >
                                View pin on map
                            </a>
                        )}
                        <div className="flex gap-3 text-xs pt-1">
                            {!a.home && (
                                <button disabled={busy} onClick={() => startTransition(() => makeHome(a.id))} className="underline font-bold">Make home</button>
                            )}
                            <button disabled={busy} onClick={() => startTransition(() => deleteAddress(a.id))} className="underline text-red">Delete</button>
                        </div>
                    </li>
                ))}
            </ul>

            {adding ? (
                <form action={action} className="space-y-3 border-t border-ink/10 pt-4">
                    <input type="hidden" name="address" value={payload} />
                    <AddressFields value={draft} onChange={setDraft} withLabel />
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" name="home" /> Set as my home address
                    </label>
                    {state.error && <p className="text-red text-sm">{state.error}</p>}
                    {state.success && <p className="text-teal text-sm font-bold">Address saved.</p>}
                    <div className="flex gap-3">
                        <button disabled={pending || !draftComplete(draft)} className="btn btn-ink disabled:opacity-50">
                            {pending ? "Saving..." : "Save address"}
                        </button>
                        <button type="button" onClick={() => { setAdding(false); setDraft(emptyDraft); }} className="btn btn-ghost text-sm">Close</button>
                    </div>
                </form>
            ) : (
                <button onClick={() => setAdding(true)} className="btn btn-ink">Add address</button>
            )}
        </div>
    );
}

export default function DeliveryProfile({
    phone,
    addresses,
    bank,
}: {
    phone: string;
    addresses: Address[];
    bank: { name: string; holder: string; last4: string };
}) {
    return (
        <div className="space-y-6">
            <PhoneSection phone={phone} />
            <AddressSection addresses={addresses} />
            <BankSection bank={bank.name} holder={bank.holder} last4={bank.last4} />
        </div>
    );
}

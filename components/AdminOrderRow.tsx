"use client";

import { useActionState } from "react";
import { updateOrder, AdminState } from "@/app/admin/actions";

const initial: AdminState = {};
const STATUSES = ["Pending payment", "Paid", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"];

export default function AdminOrderRow({
    id,
    email,
    items,
    total,
    status,
    tracking,
    created,
    address = "",
    phone = "",
    payment = "",
    voucher = "",
    lat,
    lng,
}: {
    id: string;
    email: string;
    items: string;
    total: number;
    status: string;
    tracking: string;
    created: string;
    address?: string;
    phone?: string;
    payment?: string;
    voucher?: string;
    lat?: number;
    lng?: number;
}) {
    const [state, formAction, isPending] = useActionState(updateOrder, initial);

    return (
        <form action={formAction} className="card p-5 grid md:grid-cols-[2fr_1fr_auto] gap-5 items-start">
            <input type="hidden" name="id" value={id} />
            <div className="space-y-1">
                <p className="text-sm font-bold">{email}</p>
                <p className="text-sm">{items}</p>
                <p className="text-xs text-ink/60">{created} · ₱{total.toFixed(2)}{payment ? ` · ${payment.replace("_", " ")}` : ""}{voucher ? ` · voucher ${voucher}` : ""}</p>
                {address && <p className="text-xs">Deliver to: {address}</p>}
                {phone && <p className="text-xs">Contact: {phone}</p>}
                {lat !== undefined && lng !== undefined && (
                    <a href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`} target="_blank" rel="noreferrer" className="text-xs underline">View pin on map</a>
                )}
            </div>
            <div className="space-y-2">
                <select name="status" defaultValue={status} className="field !py-2">
                    {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
                <input name="tracking" defaultValue={tracking} placeholder="Tracking number" className="field !py-2" />
            </div>
            <div className="space-y-2">
                <button disabled={isPending} className="btn btn-ink !py-2 !px-5 text-xs uppercase">
                    {isPending ? "Saving" : "Save"}
                </button>
                {state.success && <p className="text-xs font-bold text-purple">Saved</p>}
                {state.error && <p className="text-xs text-red">{state.error}</p>}
            </div>
        </form>
    );
}

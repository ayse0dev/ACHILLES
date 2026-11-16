"use client";

import { useActionState } from "react";
import { updateOrder, AdminState } from "@/app/admin/actions";

const initial: AdminState = {};
const STATUSES = ["Paid", "Packed", "Shipped", "Delivered"];

export default function AdminOrderRow({
    id,
    email,
    items,
    total,
    status,
    tracking,
    created,
}: {
    id: string;
    email: string;
    items: string;
    total: number;
    status: string;
    tracking: string;
    created: string;
}) {
    const [state, formAction, isPending] = useActionState(updateOrder, initial);

    return (
        <form action={formAction} className="card p-5 grid md:grid-cols-[2fr_1fr_auto] gap-5 items-start">
            <input type="hidden" name="id" value={id} />
            <div className="space-y-1">
                <p className="text-sm font-bold">{email}</p>
                <p className="text-sm">{items}</p>
                <p className="text-xs text-ink/60">{created} · ₱{total.toFixed(2)}</p>
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

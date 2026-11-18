"use client";

import { useActionState } from "react";
import { updateRepair, AdminState } from "@/app/admin/actions";

const initial: AdminState = {};
const STATUSES = ["Pending", "In progress", "Ready", "Completed"];

export default function AdminRepairRow({
    id,
    name,
    email,
    shoe,
    issue,
    status,
    quote,
    submitted,
    hasPhoto = false,
}: {
    id: string;
    name: string;
    email: string;
    shoe: string;
    issue: string;
    status: string;
    quote?: number;
    submitted: string;
    hasPhoto?: boolean;
}) {
    const [state, formAction, isPending] = useActionState(updateRepair, initial);

    return (
        <form action={formAction} className="card p-5 grid md:grid-cols-[2fr_1.2fr_auto] gap-5 items-start">
            <input type="hidden" name="id" value={id} />
            <div className="space-y-1">
                <p className="font-display font-bold text-lg">{shoe}</p>
                <p className="text-sm">{name} · {email}</p>
                <p className="text-xs text-ink/60">Submitted {submitted}</p>
                <p className="text-sm text-ink/80 pt-2 whitespace-pre-line">{issue}</p>
                {hasPhoto && (
                    <a href={`/api/repair-photo/${id}`} target="_blank" rel="noreferrer" className="text-xs underline font-bold">View customer photo</a>
                )}
            </div>
            <div className="space-y-2">
                <select name="status" defaultValue={status} className="field !py-2">
                    {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
                <input
                    name="quote"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={quote ?? ""}
                    placeholder="Quote ($)"
                    className="field !py-2"
                />
            </div>
            <div className="space-y-2">
                <button disabled={isPending} className="btn btn-ink !py-2 !px-5 text-sm">
                    {isPending ? "Saving" : "Save"}
                </button>
                {state.success && <p className="text-xs font-bold text-purple">Saved & emailed</p>}
                {state.error && <p className="text-xs text-red">{state.error}</p>}
            </div>
        </form>
    );
}

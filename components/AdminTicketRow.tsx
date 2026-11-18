"use client";

import { useActionState } from "react";
import { updateTicket, AdminState } from "@/app/admin/actions";

const initial: AdminState = {};
const STATUSES = ["Open", "In progress", "Resolved"];

export default function AdminTicketRow({
    id,
    reference,
    email,
    subject,
    message,
    status,
    reply,
    created,
}: {
    id: string;
    reference: string;
    email: string;
    subject: string;
    message: string;
    status: string;
    reply: string;
    created: string;
}) {
    const [state, formAction, isPending] = useActionState(updateTicket, initial);

    return (
        <form action={formAction} className="card p-5 grid md:grid-cols-[2fr_1.5fr_auto] gap-5 items-start">
            <input type="hidden" name="id" value={id} />
            <div className="space-y-1">
                <p className="text-xs font-bold tracking-widest">{reference}</p>
                <p className="font-bold">{subject}</p>
                <p className="text-sm">{message}</p>
                <p className="text-xs text-ink/60">{email} · {created}</p>
            </div>
            <div className="space-y-2">
                <select name="status" defaultValue={status} className="field !py-2">
                    {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
                <textarea name="reply" defaultValue={reply} placeholder="Reply to the customer" rows={3} className="field !py-2" />
            </div>
            <div className="space-y-2">
                <button disabled={isPending} className="btn btn-ink !py-2 !px-5 text-sm">
                    {isPending ? "Saving" : "Save"}
                </button>
                {state.success && <p className="text-xs font-bold text-purple">Saved</p>}
                {state.error && <p className="text-xs text-red">{state.error}</p>}
            </div>
        </form>
    );
}

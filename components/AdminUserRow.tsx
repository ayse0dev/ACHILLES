"use client";

import { useActionState } from "react";
import { updateRole, AdminState } from "@/app/admin/actions";

const initial: AdminState = {};

export default function AdminUserRow({
    id,
    name,
    email,
    role,
    isSelf,
}: {
    id: string;
    name: string;
    email: string;
    role: string;
    isSelf: boolean;
}) {
    const [state, formAction, isPending] = useActionState(updateRole, initial);

    return (
        <form action={formAction} className="card p-4 grid md:grid-cols-[2fr_1fr_auto] gap-4 items-center">
            <input type="hidden" name="id" value={id} />
            <div>
                <p className="font-bold">{name || "No name"} {isSelf && <span className="text-xs text-purple">(you)</span>}</p>
                <p className="text-sm text-ink/70">{email}</p>
            </div>
            <select name="role" defaultValue={role} className="field !py-2">
                <option value="customer">customer</option>
                <option value="staff">staff</option>
                <option value="admin">admin</option>
            </select>
            <div className="space-y-1">
                <button disabled={isPending} className="btn btn-ink !py-2 !px-5 text-xs uppercase">
                    {isPending ? "Saving" : "Save role"}
                </button>
                {state.success && <p className="text-xs font-bold text-purple">Saved</p>}
                {state.error && <p className="text-xs text-red">{state.error}</p>}
            </div>
        </form>
    );
}

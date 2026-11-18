"use client";

import { useActionState } from "react";
import { deleteAccount, updateRole, AdminState } from "@/app/admin/actions";

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
    const [delState, deleteAction, isDeleting] = useActionState(deleteAccount, initial);
    const canDelete = !isSelf && role !== "admin";

    if (role === "admin") {
        return (
            <div className="card p-4 flex items-center justify-between gap-4">
                <div>
                    <p className="font-bold">{name || "No name"} {isSelf && <span className="text-xs text-purple">(you)</span>}</p>
                    <p className="text-sm text-ink/70">{email}</p>
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded bg-ink text-white">Admin</span>
            </div>
        );
    }

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
            </select>
            <div className="space-y-1">
                <button disabled={isPending} className="btn btn-ink !py-2 !px-5 text-sm">
                    {isPending ? "Saving" : "Save role"}
                </button>
                {canDelete && (
                    <button
                        formAction={deleteAction}
                        disabled={isDeleting}
                        onClick={(e) => {
                            if (!window.confirm(`Permanently delete the account of ${name || email}? This cannot be undone.`)) e.preventDefault();
                        }}
                        className="btn btn-ghost !py-2 !px-5 text-sm !text-red !border-red block"
                    >
                        {isDeleting ? "Deleting" : "Delete account"}
                    </button>
                )}
                {delState.error && <p className="text-xs text-red">{delState.error}</p>}
                {state.success && <p className="text-xs font-bold text-purple">Saved</p>}
                {state.error && <p className="text-xs text-red">{state.error}</p>}
            </div>
        </form>
    );
}

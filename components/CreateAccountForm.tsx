"use client";

import { useActionState } from "react";
import { createAccount, AdminState } from "@/app/admin/actions";

const initial: AdminState = {};

export default function CreateAccountForm() {
    const [state, formAction, isPending] = useActionState(createAccount, initial);

    return (
        <form action={formAction} className="card p-5 grid md:grid-cols-[1fr_1fr_auto_auto] gap-3 items-start">
            <input name="name" placeholder="Full name" required className="field !py-2" />
            <input name="email" type="email" placeholder="Email" required className="field !py-2" />
            <select name="role" defaultValue="staff" className="field !py-2">
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
            </select>
            <button disabled={isPending} className="btn btn-ink !py-2 !px-5 text-xs uppercase">
                {isPending ? "Creating" : "Create account"}
            </button>
            {state.error && <p className="text-xs text-red md:col-span-4">{state.error}</p>}
            {state.success && <p className="text-xs text-teal font-bold md:col-span-4">Created. A temporary password was emailed to them.</p>}
        </form>
    );
}

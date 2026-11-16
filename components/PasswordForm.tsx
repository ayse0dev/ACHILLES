"use client";

import { useActionState } from "react";
import { changePassword, AccountState } from "@/app/account/actions";

const initial: AccountState = {};

export default function PasswordForm() {
    const [state, formAction, isPending] = useActionState(changePassword, initial);

    return (
        <form action={formAction} className="card p-6 space-y-3">
            <h2 className="font-black uppercase">Change password</h2>
            <input name="current" type="password" placeholder="Current password" required className="field" autoComplete="current-password" />
            <input name="next" type="password" placeholder="New password (min 8 characters)" required className="field" autoComplete="new-password" />
            {state.error && <p className="text-red text-sm">{state.error}</p>}
            {state.success && <p className="text-teal text-sm font-bold">Password updated.</p>}
            <button disabled={isPending} className="btn btn-ink">
                {isPending ? "Saving..." : "Update password"}
            </button>
        </form>
    );
}

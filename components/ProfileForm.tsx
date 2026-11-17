"use client";

import { useActionState } from "react";
import { updateProfile, AccountState } from "@/app/account/actions";

const initial: AccountState = {};

export default function ProfileForm({ name, username, email, role }: { name: string; username: string; email: string; role: string }) {
    const [state, formAction, isPending] = useActionState(updateProfile, initial);

    return (
        <form action={formAction} className="card p-6 space-y-3">
            <label className="block text-xs font-bold uppercase text-ink/60">Email</label>
            <input value={email} disabled className="field opacity-60" readOnly />
            <label className="block text-xs font-bold uppercase text-ink/60">Role</label>
            <input value={role} disabled className="field opacity-60 capitalize" readOnly />
            <label className="block text-xs font-bold uppercase text-ink/60">Name</label>
            <input name="name" defaultValue={name} required className="field" />
            <label className="block text-xs font-bold uppercase text-ink/60">Username (use it to log in)</label>
            <input name="username" defaultValue={username} required minLength={3} maxLength={20} className="field" />
            {state.error && <p className="text-red text-sm">{state.error}</p>}
            {state.success && <p className="text-teal text-sm font-bold">Saved. Your new name shows after you log in again.</p>}
            <button disabled={isPending} className="btn btn-ink">
                {isPending ? "Saving..." : "Save profile"}
            </button>
        </form>
    );
}

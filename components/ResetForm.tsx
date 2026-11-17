"use client";

import Link from "next/link";
import { useActionState } from "react";
import { resetPassword, ResetState } from "@/app/reset/actions";

const initial: ResetState = {};

export default function ResetForm({ email, token }: { email: string; token: string }) {
    const [state, formAction, isPending] = useActionState(resetPassword, initial);

    if (state.done) {
        return (
            <div className="space-y-3">
                <p className="font-bold">Password updated</p>
                <p className="text-ink/70 text-sm">You can log in with your new password now.</p>
                <Link href="/login" className="btn btn-accent">Log in</Link>
            </div>
        );
    }

    return (
        <form action={formAction} className="space-y-3">
            <input type="hidden" name="email" value={email} />
            <input type="hidden" name="token" value={token} />
            <input name="password" type="password" placeholder="New password (min 8 characters)" required autoComplete="new-password" className="field" />
            <input name="confirm" type="password" placeholder="Confirm new password" required autoComplete="new-password" className="field" />
            {state.error && <p className="text-red text-sm">{state.error}</p>}
            <button disabled={isPending} className="btn btn-accent w-full">
                {isPending ? "Saving..." : "Set new password"}
            </button>
            <Link href="/forgot" className="block text-sm underline text-center">Request a new link</Link>
        </form>
    );
}

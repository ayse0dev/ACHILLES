"use client";

import { useActionState } from "react";
import { resendVerificationLink, ResendState } from "@/app/register/actions";
import { formatWait, useCountdown } from "./useCountdown";

const initial: ResendState = {};

export default function VerifyCountdown({ email, seconds }: { email: string; seconds: number }) {
    const [state, formAction, isPending] = useActionState(resendVerificationLink, initial);
    const remaining = useCountdown(seconds, state.sent ?? 0);

    return (
        <div className="space-y-3">
            {remaining > 0 ? (
                <p className="text-sm font-bold" role="timer">
                    Link expires in <span className="text-purple text-lg">{formatWait(remaining)}</span>
                </p>
            ) : (
                <div className="space-y-2">
                    <p className="text-sm font-bold text-red">This link has expired.</p>
                    <form action={formAction}>
                        <input type="hidden" name="email" value={email} />
                        <button disabled={isPending} className="btn btn-accent !py-2 !px-5 text-xs uppercase">
                            {isPending ? "Sending..." : "Send a new link"}
                        </button>
                    </form>
                </div>
            )}
            {state.error && <p className="text-red text-xs">{state.error}</p>}
            {(state.sent ?? 0) > 0 && remaining > 0 && <p className="text-xs text-teal font-bold">New link sent.</p>}
        </div>
    );
}

"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset, ForgotState } from "./actions";

const initial: ForgotState = {};

export default function ForgotPage() {
    const [state, formAction, isPending] = useActionState(requestPasswordReset, initial);

    return (
        <div className="max-w-md mx-auto px-4 py-12">
            <div className="card p-8 space-y-5">
                <div>
                    <p className="eyebrow mb-1">Account help</p>
                    <h1 className="page-title !text-3xl">Forgot password</h1>
                </div>
                {state.sent ? (
                    <div className="space-y-3">
                        <p className="font-bold">Check your email</p>
                        <p className="text-ink/70 text-sm">
                            If an account matches, we sent a link to choose a new password. It is valid for 15 minutes.
                        </p>
                        <Link href="/login" className="btn btn-ink">Back to log in</Link>
                    </div>
                ) : (
                    <form action={formAction} className="space-y-3">
                        <p className="text-sm text-ink/70">Enter your email or username and we will email you a reset link.</p>
                        <input name="identifier" placeholder="Email or username" required autoComplete="username" className="field" />
                        {state.error && <p className="text-red text-sm">{state.error}</p>}
                        <button disabled={isPending} className="btn btn-accent w-full">
                            {isPending ? "Sending..." : "Send reset link"}
                        </button>
                        <Link href="/login" className="block text-sm underline text-center">Back to log in</Link>
                    </form>
                )}
            </div>
        </div>
    );
}

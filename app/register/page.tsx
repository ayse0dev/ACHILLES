"use client";

import Honeypot from "@/components/Honeypot";
import { useActionState } from "react";
import Link from "next/link";
import { registerUser, RegisterState } from "./actions";
import VerifyCountdown from "@/components/VerifyCountdown";

const initial: RegisterState = {};

export default function RegisterPage() {
    const [state, formAction, isPending] = useActionState(registerUser, initial);

    return (
        <div className="max-w-md mx-auto px-4 py-12">
            <div className="card p-8 space-y-5">
                <div>
                    <p className="eyebrow mb-1">Join ACHILLES</p>
                    <h1 className="page-title !text-3xl">Create account</h1>
                </div>
                {state.success ? (
                    <div className="text-center space-y-3 py-4">
                        <p className="font-black uppercase text-xl">Check your email</p>
                        <p className="text-ink/70">We sent a verification link to {state.email}. Click the button in that email to activate your account, then log in.</p>
                        <VerifyCountdown email={state.email ?? ""} seconds={state.expiresIn ?? 300} />
                        <Link href="/login" className="btn btn-ink">Go to log in</Link>
                    </div>
                ) : (
                <form action={formAction} className="space-y-3">
<Honeypot />
                    <input name="name" placeholder="Full name" required className="field" />
                    <input name="username" placeholder="Username (for quick log in)" required minLength={3} maxLength={20} autoComplete="username" className="field" />
                    <input name="email" type="email" placeholder="Email" required className="field" />
                    <input
                        name="password"
                        type="password"
                        placeholder="Password (min 8 chars)"
                        required
                        className="field"
                    />
                    {state.error && <p className="text-red text-sm">{state.error}</p>}
                    <label className="flex items-start gap-2 text-xs text-ink/70">
<input type="checkbox" name="consent" required className="mt-0.5" />
<span>I agree to the <a href="/privacy" target="_blank" className="underline">Privacy Policy</a> and consent to ACHILLES processing my details.</span>
</label>
<button disabled={isPending} className="btn btn-accent w-full">
                        {isPending ? "Creating..." : "Register"}
                    </button>
                </form>
                )}
                <Link href="/login" className="block text-sm underline w-full text-center">
                    Already have an account? Log in
                </Link>
            </div>
        </div>
    );
}

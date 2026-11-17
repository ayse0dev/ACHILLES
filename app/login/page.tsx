"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState, useState, Suspense } from "react";
import { requestLoginCode, RequestCodeState } from "./actions";

const initialRequest: RequestCodeState = {};

function safeCallback(value: string | null): string {
    if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
    return value;
}

function LoginForm() {
    const router = useRouter();
    const params = useSearchParams();
    const [requestState, requestAction, requesting] = useActionState(requestLoginCode, initialRequest);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [signingIn, setSigningIn] = useState(false);

    const step: "credentials" | "code" = requestState.codeSent ? "code" : "credentials";

    async function onVerify(e: React.FormEvent) {
        e.preventDefault();
        setSigningIn(true);
        setError("");
        const res = await signIn("credentials", {
            email,
            password,
            otp,
            redirect: false,
        });
        setSigningIn(false);
        if (res?.error) {
            setError("That code isn't valid or has expired. Check your email or request a new one.");
            return;
        }
        router.push(safeCallback(params.get("callbackUrl")));
        router.refresh();
    }

    return (
        <div className="max-w-md mx-auto px-4 py-12">
            <div className="card p-8 space-y-5">
                <div>
                    <p className="eyebrow mb-1">Welcome back</p>
                    <h1 className="page-title !text-3xl">Log in</h1>
                </div>

                {step === "credentials" && (
                    <form
                        action={(formData) => {
                            setEmail(String(formData.get("identifier") ?? ""));
                            setPassword(String(formData.get("password") ?? ""));
                            requestAction(formData);
                        }}
                        className="space-y-3"
                    >
                        <input name="identifier" placeholder="Email or username" required autoComplete="username" className="field" />
                        <input name="password" type="password" placeholder="Password" required className="field" />
                        {requestState.error && <p className="text-red text-sm">{requestState.error}</p>}
                        <a href="/forgot" className="block text-sm underline text-right">Forgot password?</a>
                        <button disabled={requesting} className="btn btn-accent w-full">
                            {requesting ? "Checking..." : "Continue"}
                        </button>
                    </form>
                )}

                {step === "code" && (
                    <div className="space-y-3">
                        <form onSubmit={onVerify} className="space-y-3">
                            <p className="text-sm text-ink/70">
                                We emailed a 6-digit code to <span className="font-bold">{requestState.sentTo ?? "your email"}</span>. It expires in 5 minutes.
                            </p>
                            <input
                                inputMode="numeric"
                                pattern="[0-9]{6}"
                                maxLength={6}
                                placeholder="6-digit code"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                required
                                autoFocus
                                className="field tracking-[0.4em] text-center text-lg"
                            />
                            {error && <p className="text-red text-sm">{error}</p>}
                            <button disabled={signingIn || otp.length !== 6} className="btn btn-accent w-full">
                                {signingIn ? "Logging in..." : "Log in"}
                            </button>
                        </form>
                        <form action={requestAction} className="text-center">
                            <input type="hidden" name="identifier" value={email} />
                            <input type="hidden" name="password" value={password} />
                            <button disabled={requesting} className="text-sm underline">
                                {requesting ? "Sending..." : "Send a new code"}
                            </button>
                        </form>
                        {requestState.error && <p className="text-red text-sm">{requestState.error}</p>}
                    </div>
                )}

                <p className="text-sm text-center">
                    No account?{" "}
                    <a href="/register" className="font-bold text-purple underline">
                        Register
                    </a>
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="max-w-md mx-auto p-6">Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}

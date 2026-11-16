"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function safeCallback(value: string | null): string {
    if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
    return value;
}

function LoginForm() {
    const router = useRouter();
    const params = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [info, setInfo] = useState("");
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);

    async function sendCode() {
        setError("");
        setInfo("");
        if (!email) {
            setError("Enter your email first.");
            return;
        }
        setSending(true);
        try {
            const res = await fetch("/api/auth/otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            if (!res.ok) {
                setError("We couldn't send a code right now. Please try again.");
                return;
            }
            setInfo("If an account exists for this email, a 6-digit code is on its way.");
        } catch {
            setError("We couldn't send a code right now. Please try again.");
        } finally {
            setSending(false);
        }
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");
        const res = await signIn("credentials", {
            email,
            password,
            otp,
            redirect: false,
        });
        setLoading(false);
        if (res?.error) {
            setError("Invalid email, password or code.");
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
                    <p className="text-sm text-ink/70 mt-2">
                        Log in with your password and the 6-digit code we email you.
                    </p>
                </div>
                <form onSubmit={onSubmit} className="space-y-3">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="field"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="field"
                    />
                    <div className="flex gap-2">
                        <input
                            inputMode="numeric"
                            pattern="[0-9]{6}"
                            maxLength={6}
                            placeholder="6-digit code"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                            required
                            className="field"
                        />
                        <button
                            type="button"
                            onClick={sendCode}
                            disabled={sending}
                            className="btn btn-ghost !py-2 !px-4 text-xs uppercase whitespace-nowrap"
                        >
                            {sending ? "Sending" : "Send code"}
                        </button>
                    </div>
                    {info && <p className="text-sm text-purple">{info}</p>}
                    {error && <p className="text-red text-sm">{error}</p>}
                    <button disabled={loading} className="btn btn-accent w-full">
                        {loading ? "Signing in..." : "Log in"}
                    </button>
                </form>
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

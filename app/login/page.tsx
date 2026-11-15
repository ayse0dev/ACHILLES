"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function LoginForm() {
    const router = useRouter();
    const params = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");
        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });
        setLoading(false);
        if (res?.error) {
            setError("Invalid email or password");
            return;
        }
        router.push(params.get("callbackUrl") ?? "/");
        router.refresh();
    }

    return (
        <div className="max-w-md mx-auto p-6 space-y-4">
            <h1 className="text-2xl font-bold">Log in</h1>
            <form onSubmit={onSubmit} className="space-y-3">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full border rounded px-3 py-2"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full border rounded px-3 py-2"
                />
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button
                    disabled={loading}
                    className="w-full bg-black text-white rounded py-2 disabled:opacity-50"
                >
                    {loading ? "Signing in..." : "Log in"}
                </button>
            </form>
            <p className="text-sm">
                No account?{" "}
                <a href="/register" className="underline">
                    Register
                </a>
            </p>
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
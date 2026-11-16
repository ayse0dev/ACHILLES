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
        <div className="max-w-md mx-auto px-4 py-12">
            <div className="card p-8 space-y-5">
                <div>
                    <p className="eyebrow mb-1">Welcome back</p>
                    <h1 className="page-title !text-3xl">Log in</h1>
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

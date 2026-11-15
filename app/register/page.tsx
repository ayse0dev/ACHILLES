"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { registerUser, RegisterState } from "./actions";
import { useEffect } from "react";

const initial: RegisterState = {};

export default function RegisterPage() {
    const [state, formAction, isPending] = useActionState(registerUser, initial);
    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            router.push("/login");
        }
    }, [state.success, router]);

    return (
        <div className="max-w-md mx-auto p-6 space-y-4">
            <h1 className="text-2xl font-bold">Create account</h1>
            <form action={formAction} className="space-y-3">
                <input
                    name="name"
                    placeholder="Full name"
                    required
                    className="w-full border rounded px-3 py-2"
                />
                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    required
                    className="w-full border rounded px-3 py-2"
                />
                <input
                    name="password"
                    type="password"
                    placeholder="Password (min 8 chars)"
                    required
                    className="w-full border rounded px-3 py-2"
                />
                {state.error && <p className="text-red-600 text-sm">{state.error}</p>}
                <button
                    disabled={isPending}
                    className="w-full bg-black text-white rounded py-2 disabled:opacity-50"
                >
                    {isPending ? "Creating..." : "Register"}
                </button>
            </form>
            <button
                onClick={() => signIn("credentials", { email: "", password: "" })}
                className="text-sm underline"
            >
                Already have an account? Log in
            </button>
        </div>
    );
}
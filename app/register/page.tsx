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
        <div className="max-w-md mx-auto px-4 py-12">
            <div className="card p-8 space-y-5">
                <div>
                    <p className="eyebrow mb-1">Join ACHILLES</p>
                    <h1 className="page-title !text-3xl">Create account</h1>
                </div>
                <form action={formAction} className="space-y-3">
                    <input name="name" placeholder="Full name" required className="field" />
                    <input name="email" type="email" placeholder="Email" required className="field" />
                    <input
                        name="password"
                        type="password"
                        placeholder="Password (min 8 chars)"
                        required
                        className="field"
                    />
                    {state.error && <p className="text-red text-sm">{state.error}</p>}
                    <button disabled={isPending} className="btn btn-accent w-full">
                        {isPending ? "Creating..." : "Register"}
                    </button>
                </form>
                <button
                    onClick={() => signIn("credentials", { email: "", password: "" })}
                    className="text-sm underline w-full text-center"
                >
                    Already have an account? Log in
                </button>
            </div>
        </div>
    );
}

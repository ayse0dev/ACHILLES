"use client";

import { useActionState } from "react";
import { submitRepair, RepairState } from "./actions";

const initial: RepairState = {};

export default function RepairPage() {
    const [state, formAction, isPending] = useActionState(submitRepair, initial);

    if (state.success) {
        return (
            <div className="max-w-md mx-auto p-6">
                <h1 className="text-2xl font-bold mb-2">Request received!</h1>
                <p>We&apos;ll email you within 24 hours with a quote.</p>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto p-6 space-y-4">
            <h1 className="text-2xl font-bold">Request a shoe repair</h1>
            <form action={formAction} className="space-y-3">
                <input
                    name="name"
                    placeholder="Your name"
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
                    name="phone"
                    placeholder="Phone (optional)"
                    className="w-full border rounded px-3 py-2"
                />
                <input
                    name="shoeDescription"
                    placeholder="Shoe brand / model"
                    required
                    className="w-full border rounded px-3 py-2"
                />
                <textarea
                    name="issue"
                    placeholder="Describe the damage"
                    required
                    rows={4}
                    className="w-full border rounded px-3 py-2"
                />
                <input
                    name="photoUrl"
                    type="url"
                    placeholder="Photo URL (optional — upload to Cloudinary/Imgur first)"
                    className="w-full border rounded px-3 py-2"
                />
                {state.error && <p className="text-red-600 text-sm">{state.error}</p>}
                <button
                    disabled={isPending}
                    className="w-full bg-black text-white rounded py-2 disabled:opacity-50"
                >
                    {isPending ? "Submitting..." : "Submit request"}
                </button>
            </form>
        </div>
    );
}
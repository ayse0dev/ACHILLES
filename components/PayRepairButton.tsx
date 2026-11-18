"use client";

import { useState } from "react";

export default function PayRepairButton({ reference }: { reference: string }) {
    const [pending, setPending] = useState(false);
    const [error, setError] = useState("");

    async function pay() {
        setError("");
        setPending(true);
        try {
            const res = await fetch("/api/repair/pay", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reference }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error ?? "Payment could not be started.");
                return;
            }
            window.location.assign(data.url);
        } catch {
            setError("Payment could not be started.");
        } finally {
            setPending(false);
        }
    }

    return (
        <span className="flex flex-col items-end gap-1">
            <button onClick={pay} disabled={pending} className="rounded-full bg-teal border-2 border-ink px-4 py-2 text-xs font-bold hover:bg-yellow transition disabled:opacity-60">
                {pending ? "Please wait..." : "Pay online"}
            </button>
            {error && <span className="text-red font-normal">{error}</span>}
        </span>
    );
}

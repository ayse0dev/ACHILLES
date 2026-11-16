"use client";

import Honeypot from "@/components/Honeypot";
import { useActionState } from "react";
import { openTicket, SupportState } from "./actions";

const initial: SupportState = {};

function isOnline() {
    const hour =
        Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: "Asia/Manila" }).format(new Date())) % 24;
    return hour >= 9 && hour < 22;
}

export default function SupportPage() {
    const [state, formAction, isPending] = useActionState(openTicket, initial);
    const online = isOnline();

    return (
        <div className="max-w-xl mx-auto px-4 py-10 space-y-6">
            <div>
                <p className="eyebrow mb-2">Help</p>
                <h1 className="page-title">Support</h1>
                <p className="text-ink/70 mt-2" suppressHydrationWarning>
                    {online
                        ? "Our team is online (9 AM – 10 PM). Open a ticket and we will reply soon."
                        : "We are offline right now. Open a ticket and we will reply when support opens at 9 AM."}
                </p>
            </div>

            {state.reference ? (
                <div className="card p-8 text-center space-y-3">
                    <p className="eyebrow">Ticket opened</p>
                    <p className="font-black text-2xl tracking-widest">{state.reference}</p>
                    <p className="text-sm text-ink/70">Keep this reference to follow your ticket on the Track page.</p>
                </div>
            ) : (
                <form action={formAction} className="card p-6 space-y-3">
<Honeypot />
                    <input name="name" placeholder="Your name" required className="field" />
                    <input name="email" type="email" placeholder="Email" required className="field" />
                    <input name="subject" placeholder="Subject" required className="field" />
                    <textarea name="message" placeholder="How can we help?" rows={5} required className="field" />
                    {state.error && <p className="text-red text-sm">{state.error}</p>}
                    <button disabled={isPending} className="btn btn-accent w-full">
                        {isPending ? "Sending..." : "Open ticket"}
                    </button>
                </form>
            )}
        </div>
    );
}

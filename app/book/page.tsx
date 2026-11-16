"use client";

import { useActionState } from "react";
import Link from "next/link";
import { bookAppointment, BookState } from "./actions";

const initial: BookState = {};

export default function BookPage() {
    const [state, formAction, isPending] = useActionState(bookAppointment, initial);

    return (
        <div className="max-w-xl mx-auto px-4 py-12">
            {state.success ? (
                <div className="card p-8 text-center space-y-4">
                    <p className="eyebrow">Booking received</p>
                    <h1 className="page-title !text-3xl">We&apos;ll be in touch</h1>
                    <p className="text-ink/70">We&apos;ll confirm your time by email.</p>
                    <Link href="/repair" className="btn btn-ghost">Back to repairs</Link>
                </div>
            ) : (
                <div className="card p-6 md:p-8 space-y-5">
                    <div>
                        <p className="eyebrow mb-1">Drop-off &amp; pickup</p>
                        <h1 className="page-title !text-3xl">Book an appointment</h1>
                    </div>
                    <form action={formAction} className="space-y-3">
                        <select name="service" required defaultValue="Drop-off" className="field">
                            <option value="Drop-off">Drop-off for repair</option>
                            <option value="Pickup">Pickup of finished shoes</option>
                            <option value="Consultation">Repair consultation</option>
                        </select>
                        <input name="name" placeholder="Your name" required className="field" />
                        <input name="email" type="email" placeholder="Email" required className="field" />
                        <input name="phone" placeholder="Phone (optional)" className="field" />
                        <input name="shoeDescription" placeholder="Shoe brand / model" required className="field" />
                        <label className="block text-sm font-bold">
                            Preferred date (optional)
                            <input name="preferredDate" type="date" className="field mt-1" />
                        </label>
                        <textarea name="notes" placeholder="Anything we should know?" rows={3} className="field" />
                        {state.error && <p className="text-red text-sm">{state.error}</p>}
                        <button disabled={isPending} className="btn btn-accent w-full">
                            {isPending ? "Booking..." : "Request booking"}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

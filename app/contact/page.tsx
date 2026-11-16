"use client";

import Honeypot from "@/components/Honeypot";
import { useActionState } from "react";
import { sendContactMessage, ContactState } from "./actions";
import { contact } from "@/lib/business";

const initial: ContactState = {};

export default function ContactPage() {
    const [state, formAction, isPending] = useActionState(sendContactMessage, initial);

    return (
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-12 grid md:grid-cols-[1fr_1.3fr] gap-10">
            <div className="space-y-6">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple mb-2">Get in touch</p>
                    <h1 className="uppercase font-black text-4xl md:text-5xl tracking-tight">Contact</h1>
                </div>
                <dl className="space-y-4 text-sm">
                    <div>
                        <dt className="font-bold uppercase text-xs text-ink/60">Shop</dt>
                        <dd>{contact.address}</dd>
                    </div>
                    <div>
                        <dt className="font-bold uppercase text-xs text-ink/60">Hours</dt>
                        <dd>{contact.hours}</dd>
                    </div>
                    {contact.phone && (
                        <div>
                            <dt className="font-bold uppercase text-xs text-ink/60">Phone</dt>
                            <dd>{contact.phone}</dd>
                        </div>
                    )}
                    <div>
                        <dt className="font-bold uppercase text-xs text-ink/60">Shipping</dt>
                        <dd>{contact.shipping}</dd>
                    </div>
                </dl>
            </div>

            <div className="card p-6 md:p-8">
                {state.success ? (
                    <div className="space-y-3 text-center py-8">
                        <p className="eyebrow">Message sent</p>
                        <h2 className="page-title !text-3xl">Thanks for reaching out</h2>
                        <p className="text-ink/70">We&apos;ll reply by email as soon as we can.</p>
                    </div>
                ) : (
                    <form action={formAction} className="space-y-3">
<Honeypot />
                        <h2 className="font-black uppercase text-xl">Send a message</h2>
                        <input name="name" placeholder="Name" required className="field" />
                        <input name="phone" placeholder="Contact number (optional)" className="field" />
                        <input name="email" type="email" placeholder="Email" required className="field" />
                        <select name="service" required defaultValue="Inquiry" className="field">
                            <option value="Repair">Repair</option>
                            <option value="Purchase">Purchase</option>
                            <option value="Inquiry">Inquiry</option>
                        </select>
                        <input name="item" placeholder="Item description (optional)" className="field" />
                        <input name="photoUrl" type="url" placeholder="Photo URL (optional)" className="field" />
                        <textarea name="message" placeholder="Message" required rows={5} className="field" />
                        {state.error && <p className="text-red text-sm">{state.error}</p>}
                        <button disabled={isPending} className="btn btn-accent w-full">
                            {isPending ? "Sending..." : "Send message"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

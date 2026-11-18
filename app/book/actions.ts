"use server";

import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { base } from "@/lib/airtable";
import { sendEmail } from "@/lib/mail";
import { notify } from "@/lib/notify";
import { allow, TOO_MANY } from "@/lib/rateLimit";
import { newReference } from "@/lib/reference";
import { normalizePhone } from "@/lib/phone";
import { repairGroups } from "@/lib/business";
import { brands, checkIns, estimateFor, payments, peso, severities } from "@/lib/repairEstimate";

const schema = z.object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().email().max(120),
    phone: z.string().trim().max(20),
    brand: z.enum(brands as unknown as [string, ...string[]]),
    model: z.string().trim().min(2).max(100),
    services: z.array(z.string().max(80)).min(1).max(12),
    severity: z.enum(severities as unknown as [string, ...string[]]),
    description: z.string().trim().min(5).max(1200),
    checkIn: z.enum(checkIns),
    preferredDate: z.string().trim().max(20).optional(),
    payment: z.enum(payments.map((p) => p.key) as unknown as [string, ...string[]]),
    photo: z.string().max(90000).optional(),
});

export type BookState = { error?: string; success?: boolean; reference?: string };

export async function bookAppointment(_prev: BookState, formData: FormData): Promise<BookState> {
    if (formData.get("website")) return { success: true };
    if (!(await allow("book", 5, 3600))) return { error: TOO_MANY };
    if (!formData.get("consent")) return { error: "Please agree to the Privacy Policy to continue." };

    let raw: unknown;
    try {
        raw = JSON.parse(String(formData.get("payload") ?? ""));
    } catch {
        return { error: "Something went wrong with the form. Please try again." };
    }
    const parsed = schema.safeParse(raw);
    if (!parsed.success) return { error: "Please complete every required field, including at least one service." };
    const d = parsed.data;

    const phone = normalizePhone(d.phone);
    if (!phone) return { error: "Enter a valid mobile number like +63-9xx-xxx-xxxx." };

    const known = new Map(repairGroups.flatMap((g) => g.rows.map((r) => [r.service, r.price] as const)));
    const services = d.services.filter((s) => known.has(s));
    if (services.length === 0) return { error: "Please choose at least one service." };

    let photo = "";
    if (d.photo) {
        const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(d.photo);
        const bytes = m ? Buffer.from(m[1], "base64") : null;
        if (!bytes || bytes[0] !== 0xff || bytes[1] !== 0xd8) return { error: "That photo could not be used. Try another one." };
        photo = d.photo;
    }

    const est = estimateFor(services.map((s) => known.get(s) ?? ""));
    const estimateText =
        est.low === 0 && est.high === 0
            ? "Quote on inspection"
            : `${peso(est.low)} – ${peso(est.high)}${est.unknown ? " + items quoted on inspection" : ""}`;
    const paymentLabel = payments.find((p) => p.key === d.payment)?.title ?? d.payment;

    const session = await getServerSession(authOptions);
    const reference = newReference("RP");

    const issue = [
        `Services: ${services.join("; ")}`,
        `Severity: ${d.severity}`,
        `Check-in: ${d.checkIn}${d.preferredDate ? ` (preferred ${d.preferredDate})` : ""}`,
        `Payment preference: ${paymentLabel}`,
        `Estimate: ${estimateText}`,
        `Notes: ${d.description}`,
    ].join("\n");

    await base("RepairRequests").create({
        Reference: reference,
        Name: d.name,
        Email: d.email,
        Phone: phone,
        ShoeDescription: `${d.brand} – ${d.model}`,
        Issue: issue,
        ...(photo ? { Photo: photo } : {}),
        Status: "Pending",
        SubmittedAt: new Date().toISOString(),
        UserId: (session?.user as { id?: string } | undefined)?.id ?? "",
    });

    await base("Appointments")
        .create({
            Name: d.name,
            Email: d.email,
            Phone: phone,
            Service: d.checkIn === "Shop Appointment" ? "Consultation" : "Drop-off",
            ShoeDescription: `${d.brand} – ${d.model}`,
            PreferredDate: d.preferredDate || undefined,
            Notes: `${reference}\n${issue}`,
            Status: "Requested",
            CreatedAt: new Date().toISOString(),
        })
        .catch(() => null);

    await sendEmail(
        d.email,
        "We received your ACHILLES booking",
        `Hi ${d.name},\n\nThanks for booking with ACHILLES.\n\nReference: ${reference}\nShoe: ${d.brand} – ${d.model}\nServices: ${services.join(", ")}\nCheck-in: ${d.checkIn}\nEstimated cost: ${estimateText}\n\nThe estimate is not final. We confirm the exact price after inspection and you pay nothing until you approve it. Use your reference on the Track page to follow progress.`
    );
    await notify(d.email, "Booking received", `Reference ${reference}. Estimated ${estimateText}.`, "/track");

    return { success: true, reference };
}

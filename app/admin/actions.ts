"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { base } from "@/lib/airtable";
import { formulaString } from "@/lib/formula";
import { sendEmail } from "@/lib/mail";
import { notify } from "@/lib/notify";
import { audit } from "@/lib/audit";
import { isAdmin, isStaff } from "@/lib/roles";
import { getCurrentUser } from "@/lib/session";

const REPAIR_STATUSES = ["Pending", "In progress", "Ready", "Completed"] as const;
const ORDER_STATUSES = ["Paid", "Packed", "Shipped", "Delivered"] as const;
const TICKET_STATUSES = ["Open", "In progress", "Resolved"] as const;
const ROLE_OPTIONS =["customer", "staff", "admin"] as const;

export type AdminState = { error?: string; success?: boolean };

export async function updateRepair(_prev: AdminState, formData: FormData): Promise<AdminState> {
    const user = await getCurrentUser();
    if (!user || !isStaff(user.role)) return { error: "Not authorized." };

    const parsed = z
        .object({ id: z.string().min(1), status: z.enum(REPAIR_STATUSES), quote: z.string().optional() })
        .safeParse({
            id: formData.get("id"),
            status: formData.get("status"),
            quote: formData.get("quote") || undefined,
        });
    if (!parsed.success) return { error: "Invalid status." };

    const quoteNumber = parsed.data.quote ? Number(parsed.data.quote) : undefined;
    if (quoteNumber !== undefined && (Number.isNaN(quoteNumber) || quoteNumber < 0)) {
        return { error: "Quote must be a positive number." };
    }

    const before = await base("RepairRequests").find(parsed.data.id);
    const fields = before.fields as { Name?: string; Email?: string; Status?: string; Quote?: number; ShoeDescription?: string };
    const statusChanged = fields.Status !== parsed.data.status;
    const quoteChanged = quoteNumber !== undefined && quoteNumber !== fields.Quote;

    await audit(user.email, "update_repair", parsed.data.id, `status=${parsed.data.status}`);
    await base("RepairRequests").update(parsed.data.id, {
        Status: parsed.data.status,
        ...(quoteNumber !== undefined ? { Quote: quoteNumber } : {}),
    });

    if (fields.Email && (statusChanged || quoteChanged)) {
        const lines = [`Hi ${fields.Name ?? "there"},`, "", `Your repair for ${fields.ShoeDescription ?? "your shoe"} is now: ${parsed.data.status}.`];
        if (quoteNumber !== undefined) lines.push(`Quote: ₱${quoteNumber.toFixed(2)}`);
        lines.push("", "Check the Track page any time for updates.");
        await sendEmail(fields.Email, "Your ACHILLES repair update", lines.join("\n"));
    }

    revalidatePath("/admin");
    revalidatePath("/staff");
    return { success: true };
}

export async function updateOrder(_prev: AdminState, formData: FormData): Promise<AdminState> {
    const user = await getCurrentUser();
    if (!user || !isStaff(user.role)) return { error: "Not authorized." };

    const parsed = z
        .object({ id: z.string().min(1), status: z.enum(ORDER_STATUSES), tracking: z.string().max(100).optional() })
        .safeParse({
            id: formData.get("id"),
            status: formData.get("status"),
            tracking: formData.get("tracking") || undefined,
        });
    if (!parsed.success) return { error: "Invalid order update." };

    const before = await base("Orders").find(parsed.data.id);
    const fields = before.fields as { Email?: string; Status?: string; Tracking?: string };

    await audit(user.email, "update_order", parsed.data.id, `status=${parsed.data.status}`);
    await base("Orders").update(parsed.data.id, {
        Status: parsed.data.status,
        Tracking: parsed.data.tracking ?? fields.Tracking ?? "",
    });

    if (fields.Email && fields.Status !== parsed.data.status && parsed.data.status !== "Paid") {
        const tracking = parsed.data.tracking ? `\nTracking number: ${parsed.data.tracking}` : "";
        await sendEmail(
            fields.Email,
            `Your ACHILLES order is ${parsed.data.status.toLowerCase()}`,
            `Your order is now: ${parsed.data.status}.${tracking}\n\nYou can see your orders on the Orders page.`
        );
    }

    revalidatePath("/admin");
    revalidatePath("/staff");
    return { success: true };
}

export async function adjustStock(_prev: AdminState, formData: FormData): Promise<AdminState> {
    const user = await getCurrentUser();
    if (!user || !isStaff(user.role)) return { error: "Not authorized." };

    const parsed = z
        .object({
            slug: z.string().min(1),
            change: z.coerce.number().int().min(-10000).max(10000),
            note: z.string().max(200).optional(),
        })
        .safeParse({
            slug: formData.get("slug"),
            change: formData.get("change"),
            note: formData.get("note") || undefined,
        });
    if (!parsed.success || parsed.data.change === 0) return { error: "Enter a non-zero quantity." };

    const found = await base("Products")
        .select({ filterByFormula: `{Slug} = ${formulaString(parsed.data.slug)}`, maxRecords: 1 })
        .firstPage();
    if (found.length === 0) return { error: "Product not found." };

    const current = Number((found[0].fields as { Stock?: number }).Stock ?? 0);
    const next = Math.max(0, current + parsed.data.change);
    const name = String((found[0].fields as { Name?: string }).Name ?? parsed.data.slug);

    await audit(user.email, "adjust_stock", parsed.data.slug, `change=${parsed.data.change}`);
    await base("Products").update(found[0].id, { Stock: next });
    await base("StockIntakes").create({
        Product: name,
        Slug: parsed.data.slug,
        Quantity: parsed.data.change,
        Note: parsed.data.note ?? "",
        CreatedAt: new Date().toISOString(),
    });

    revalidatePath("/admin");
    revalidatePath("/staff");
    return { success: true };
}

export async function updateRole(_prev: AdminState, formData: FormData): Promise<AdminState> {
    const user = await getCurrentUser();
    if (!user || !isAdmin(user.role)) return { error: "Only admins can change roles." };

    const parsed = z
        .object({ id: z.string().min(1), role: z.enum(ROLE_OPTIONS) })
        .safeParse({ id: formData.get("id"), role: formData.get("role") });
    if (!parsed.success) return { error: "Invalid role." };

    if (parsed.data.id === user.id && parsed.data.role !== "admin") {
        return { error: "You can't remove your own admin role." };
    }

    await audit(user.email, "change_role", parsed.data.id, `role=${parsed.data.role}`);
    await base("Users").update(parsed.data.id, { Role: parsed.data.role });
    revalidatePath("/admin");
    revalidatePath("/staff");
    return { success: true };
}

export async function clockAttendance(_prev: AdminState, formData: FormData): Promise<AdminState> {
    const user = await getCurrentUser();
    if (!user || !isStaff(user.role)) return { error: "Not authorized." };

    const mode = formData.get("mode");
    const today = new Date().toISOString().slice(0, 10);
    const email = user.email ?? "";

    const open = await base("Attendance")
        .select({
            filterByFormula: `AND({Email} = ${formulaString(email)}, IS_SAME({Date}, ${formulaString(today)}, "day"))`,
            maxRecords: 1,
        })
        .firstPage();

    if (mode === "in") {
        if (open.length > 0) return { error: "You already clocked in today." };
        await base("Attendance").create({
            Email: email,
            Name: user.name ?? email,
            Date: today,
            ClockIn: new Date().toISOString(),
        });
    } else {
        if (open.length === 0) return { error: "Clock in first." };
        await base("Attendance").update(open[0].id, { ClockOut: new Date().toISOString() });
    }

    revalidatePath("/admin");
    revalidatePath("/staff");
    return { success: true };
}

export async function updateTicket(_prev: AdminState, formData: FormData): Promise<AdminState> {
    const user = await getCurrentUser();
    if (!user || !isStaff(user.role)) return { error: "Not authorized." };

    const parsed = z
        .object({ id: z.string().min(1), status: z.enum(TICKET_STATUSES), reply: z.string().max(2000).optional() })
        .safeParse({ id: formData.get("id"), status: formData.get("status"), reply: formData.get("reply") || undefined });
    if (!parsed.success) return { error: "Invalid ticket update." };

    const before = await base("Tickets").find(parsed.data.id);
    const f = before.fields as { Email?: string; Reference?: string; Status?: string; Subject?: string };

    await audit(user.email, "update_ticket", parsed.data.id, `status=${parsed.data.status}`);
    await base("Tickets").update(parsed.data.id, {
        Status: parsed.data.status,
        ...(parsed.data.reply ? { Reply: parsed.data.reply } : {}),
    });

    if (f.Email && (parsed.data.reply || f.Status !== parsed.data.status)) {
        const body = parsed.data.reply ? `\n\n${parsed.data.reply}` : "";
        await sendEmail(
            f.Email,
            `Update on your ACHILLES ticket ${f.Reference ?? ""}`,
            `Your ticket "${f.Subject ?? ""}" is now: ${parsed.data.status}.${body}`
        );
        await notify(f.Email, "Ticket update", `${f.Reference ?? "Your ticket"} is now: ${parsed.data.status}.`, "/track");
    }

    revalidatePath("/admin");
    revalidatePath("/staff");
    return { success: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { base } from "@/lib/airtable";
import { formulaString } from "@/lib/formula";
import { sendEmail } from "@/lib/mail";
import { isAdmin, isStaff } from "@/lib/roles";
import { getCurrentUser } from "@/lib/session";

const REPAIR_STATUSES = ["Pending", "In progress", "Ready", "Completed"] as const;
const ORDER_STATUSES = ["Paid", "Packed", "Shipped", "Delivered"] as const;
const ROLE_OPTIONS = ["customer", "staff", "admin"] as const;

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

    await base("Products").update(found[0].id, { Stock: next });
    await base("StockIntakes").create({
        Product: name,
        Slug: parsed.data.slug,
        Quantity: parsed.data.change,
        Note: parsed.data.note ?? "",
        CreatedAt: new Date().toISOString(),
    });

    revalidatePath("/admin");
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

    await base("Users").update(parsed.data.id, { Role: parsed.data.role });
    revalidatePath("/admin");
    return { success: true };
}

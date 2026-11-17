"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { base } from "@/lib/airtable";
import { addressFields, findOwnedAddress, listAddresses } from "@/lib/addresses";
import { addressSchema } from "@/lib/addressTypes";
import { normalizePhone } from "@/lib/phone";
import { getCurrentUser } from "@/lib/session";

export type DeliveryState = { error?: string; success?: boolean };

export async function savePhone(_prev: DeliveryState, formData: FormData): Promise<DeliveryState> {
    const user = await getCurrentUser();
    if (!user) return { error: "Log in first." };
    const phone = normalizePhone(String(formData.get("phone") ?? ""));
    if (!phone) return { error: "Enter a Philippine mobile number like +63-9xx-xxx-xxxx." };
    await base("Users").update(user.id, { Phone: phone });
    revalidatePath("/profile");
    return { success: true };
}

export async function saveBank(_prev: DeliveryState, formData: FormData): Promise<DeliveryState> {
    const user = await getCurrentUser();
    if (!user) return { error: "Log in first." };
    if (formData.get("remove")) {
        await base("Users").update(user.id, { BankName: "", BankHolder: "", BankLast4: "" });
        revalidatePath("/profile");
        return { success: true };
    }
    const parsed = z
        .object({
            bank: z.string().trim().min(2).max(60),
            holder: z.string().trim().min(2).max(80),
            last4: z.string().trim().regex(/^\d{4}$/),
        })
        .safeParse({ bank: formData.get("bank"), holder: formData.get("holder"), last4: formData.get("last4") });
    if (!parsed.success) return { error: "Enter the bank name, account holder and only the last 4 digits of the account number." };
    await base("Users").update(user.id, {
        BankName: parsed.data.bank,
        BankHolder: parsed.data.holder,
        BankLast4: parsed.data.last4,
    });
    revalidatePath("/profile");
    return { success: true };
}

export async function saveAddress(_prev: DeliveryState, formData: FormData): Promise<DeliveryState> {
    const user = await getCurrentUser();
    if (!user) return { error: "Log in first." };
    let raw: unknown;
    try {
        raw = JSON.parse(String(formData.get("address") ?? ""));
    } catch {
        return { error: "Invalid address." };
    }
    const parsed = addressSchema.safeParse(raw);
    if (!parsed.success) return { error: "Complete the region, municipality, barangay and street." };

    const existing = await listAddresses(user.email);
    if (existing.length >= 10) return { error: "You can save up to 10 addresses. Delete one first." };

    const home = formData.get("home") === "on" || !existing.some((a) => a.home);
    if (home) {
        const current = existing.filter((a) => a.home);
        if (current.length) await base("Addresses").update(current.map((a) => ({ id: a.id, fields: { Home: false } })));
    }
    await base("Addresses").create(addressFields(user.email, parsed.data, home));
    revalidatePath("/profile");
    return { success: true };
}

export async function deleteAddress(id: string) {
    const user = await getCurrentUser();
    if (!user) return;
    const owned = await findOwnedAddress(user.email, id);
    if (!owned) return;
    await base("Addresses").destroy(id);
    revalidatePath("/profile");
}

export async function makeHome(id: string) {
    const user = await getCurrentUser();
    if (!user) return;
    const owned = await findOwnedAddress(user.email, id);
    if (!owned) return;
    const all = await listAddresses(user.email);
    const others = all.filter((a) => a.home && a.id !== id);
    if (others.length) await base("Addresses").update(others.map((a) => ({ id: a.id, fields: { Home: false } })));
    await base("Addresses").update(id, { Home: true });
    revalidatePath("/profile");
}

import { base } from "./airtable";
import { formulaString } from "./formula";

export type Voucher = {
    id: string;
    code: string;
    type: "Percent" | "Fixed";
    value: number;
    minSpend: number;
    usesLeft: number | null;
};

type Fields = {
    Code?: string;
    Type?: string;
    Value?: number;
    MinSpend?: number;
    Active?: boolean;
    ExpiresAt?: string;
    UsesLeft?: number;
};

export type VoucherResult = { ok: true; voucher: Voucher; off: number } | { ok: false; error: string };

export async function checkVoucher(rawCode: string, subtotal: number): Promise<VoucherResult> {
    const code = rawCode.trim().toUpperCase();
    if (!/^[A-Z0-9_-]{3,30}$/.test(code)) return { ok: false, error: "That voucher code is not valid." };
    try {
        const found = await base("Vouchers")
            .select({ filterByFormula: `UPPER({Code}) = ${formulaString(code)}`, maxRecords: 1 })
            .firstPage();
        if (found.length === 0) return { ok: false, error: "That voucher code is not valid." };
        const f = found[0].fields as Fields;
        if (!f.Active) return { ok: false, error: "That voucher is no longer active." };
        if (f.ExpiresAt && new Date(f.ExpiresAt).getTime() < Date.now()) return { ok: false, error: "That voucher has expired." };
        if (typeof f.UsesLeft === "number" && f.UsesLeft <= 0) return { ok: false, error: "That voucher has been fully used." };
        const minSpend = Number(f.MinSpend ?? 0);
        if (subtotal < minSpend) return { ok: false, error: `Spend at least ₱${minSpend.toFixed(2)} to use this voucher.` };
        const type = f.Type === "Fixed" ? "Fixed" : "Percent";
        const value = Number(f.Value ?? 0);
        if (value <= 0) return { ok: false, error: "That voucher is not valid." };
        const raw = type === "Percent" ? subtotal * (Math.min(value, 100) / 100) : value;
        const off = Math.min(Math.round(raw * 100) / 100, subtotal);
        return {
            ok: true,
            off,
            voucher: { id: found[0].id, code, type, value, minSpend, usesLeft: typeof f.UsesLeft === "number" ? f.UsesLeft : null },
        };
    } catch {
        return { ok: false, error: "Vouchers are unavailable right now." };
    }
}

export async function redeemVoucher(voucher: Voucher) {
    if (voucher.usesLeft === null) return;
    try {
        await base("Vouchers").update(voucher.id, { UsesLeft: Math.max(0, voucher.usesLeft - 1) });
    } catch {
        return;
    }
}

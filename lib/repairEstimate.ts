export function parseRange(price: string): { low: number; high: number } | null {
    const numbers = Array.from(price.matchAll(/₱\s*([\d,]+)/g)).map((m) => Number(m[1].replace(/,/g, "")));
    if (numbers.length === 0 || numbers.some((n) => !Number.isFinite(n))) return null;
    return { low: Math.min(...numbers), high: Math.max(...numbers) };
}

export function peso(n: number): string {
    return `₱${n.toLocaleString("en-PH")}`;
}

export function estimateFor(prices: string[]): { low: number; high: number; unknown: number } {
    let low = 0;
    let high = 0;
    let unknown = 0;
    for (const p of prices) {
        const r = parseRange(p);
        if (!r) unknown += 1;
        else {
            low += r.low;
            high += r.high;
        }
    }
    return { low, high, unknown };
}

export const brands = [
    "Nike / Jordan",
    "Adidas",
    "New Balance",
    "Converse / Vans",
    "Puma / Reebok",
    "Asics / Mizuno",
    "Skechers / Fila",
    "Clarks / Florsheim",
    "Dr. Martens / Timberland",
    "Heels / Dress shoes (any brand)",
    "Local or unbranded",
    "Handbag / leather goods",
    "Other",
];

export const severities = [
    "Light (surface dirt, minor wear)",
    "Moderate (deep dirt, sole stains, scuffs)",
    "Heavy (separation, tears, broken parts)",
    "Severe (needs full rebuild)",
];

export const checkIns = ["Studio Drop-off", "Courier Mail-in", "Shop Appointment"] as const;

export const payments = [
    { key: "cod", tag: "COD / Drop-off", title: "Cash on Delivery / Drop-off (COD)", text: "Magbayad ng cash kapag inihatid sa studio o kapag inihatid na pabalik ang bagong ayos mong sapatos.", foot: "No card needed today" },
    { key: "ewallet", tag: "E-wallet & Bank", title: "GCash / Maya / Online Banking", text: "Mabilis na pagbabayad gamit ang QR Ph, GCash, Maya, o BDO/BPI online bank transfer.", foot: "QR Ph / GCash / Maya / InstaPay" },
    { key: "card", tag: "Cards", title: "Credit / Debit Card", text: "Ligtas na pagbabayad gamit ang Visa, Mastercard, o JCB credit/debit card.", foot: "Visa / Mastercard / JCB" },
] as const;

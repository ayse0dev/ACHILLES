import type { DayTotal } from "@/components/MoneyFlow";

export type Buyer = { email: string; orders: number; spent: number; tier: "Rising" | "Middle" | "Low" };

export function buildDays(
    orders: { date?: string; total: number }[],
    repairs: { date?: string; total: number }[],
    count = 14
): DayTotal[] {
    const days: DayTotal[] = [];
    const keys: string[] = [];
    for (let i = count - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        keys.push(d.toISOString().slice(0, 10));
        days.push({ label: `${d.getMonth() + 1}/${d.getDate()}`, shop: 0, repair: 0 });
    }
    for (const o of orders) {
        const i = keys.indexOf((o.date ?? "").slice(0, 10));
        if (i >= 0) days[i].shop += o.total;
    }
    for (const r of repairs) {
        const i = keys.indexOf((r.date ?? "").slice(0, 10));
        if (i >= 0) days[i].repair += r.total;
    }
    return days;
}

export function buildBuyers(orders: { email: string; total: number }[]): Buyer[] {
    const map = new Map<string, { orders: number; spent: number }>();
    for (const o of orders) {
        const key = o.email.toLowerCase();
        if (!key) continue;
        const cur = map.get(key) ?? { orders: 0, spent: 0 };
        cur.orders += 1;
        cur.spent += o.total;
        map.set(key, cur);
    }
    const sorted = [...map.entries()].sort((a, b) => b[1].spent - a[1].spent);
    const third = Math.ceil(sorted.length / 3);
    return sorted.map(([email, v], i) => ({
        email,
        ...v,
        tier: i < third ? "Rising" : i < third * 2 ? "Middle" : "Low",
    }));
}

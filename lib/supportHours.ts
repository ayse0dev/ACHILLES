export const SUPPORT_OPEN = 9;
export const SUPPORT_CLOSE = 22;

export function supportOnline(now: Date = new Date()) {
    const hour = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: "Asia/Manila" }).format(now)) % 24;
    return hour >= SUPPORT_OPEN && hour < SUPPORT_CLOSE;
}

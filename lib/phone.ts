export function normalizePhone(input: string): string | null {
    const digits = input.replace(/\D/g, "");
    let local = "";
    if (digits.startsWith("63") && digits.length === 12) local = digits.slice(2);
    else if (digits.startsWith("09") && digits.length === 11) local = digits.slice(1);
    else if (digits.startsWith("9") && digits.length === 10) local = digits;
    if (!/^9\d{9}$/.test(local)) return null;
    return `+63${local}`;
}

export function formatPhone(value: string): string {
    const n = normalizePhone(value);
    if (!n) return value;
    return `+63-${n.slice(3, 6)}-${n.slice(6, 9)}-${n.slice(9)}`;
}

export const ROLES = ["customer", "staff", "admin"] as const;

export type Role = (typeof ROLES)[number];

export function normalizeRole(value: unknown): Role {
    const cleaned = typeof value === "string" ? value.trim().toLowerCase() : "";
    return ROLES.includes(cleaned as Role) ? (cleaned as Role) : "customer";
}

export function isStaff(role: string | undefined): boolean {
    const r = normalizeRole(role);
    return r === "staff" || r === "admin";
}

export function isAdmin(role: string | undefined): boolean {
    return normalizeRole(role) === "admin";
}

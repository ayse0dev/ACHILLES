export const ROLES = ["customer", "staff", "admin"] as const;

export type Role = (typeof ROLES)[number];

export function normalizeRole(value: unknown): Role {
    return ROLES.includes(value as Role) ? (value as Role) : "customer";
}

export function isStaff(role: string | undefined): boolean {
    return role === "staff" || role === "admin";
}

import { base } from "./airtable";

export async function audit(actor: string, action: string, target = "", detail = "") {
    try {
        await base("AuditLog").create({
            Actor: actor,
            Action: action,
            Target: target,
            Detail: detail.slice(0, 500),
            CreatedAt: new Date().toISOString(),
        });
    } catch {
        return;
    }
}

export function maskEmail(email: string): string {
    const [user, domain] = email.split("@");
    if (!domain) return email;
    return `${user.slice(0, 2)}${"*".repeat(Math.max(1, user.length - 2))}@${domain}`;
}

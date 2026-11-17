import crypto from "crypto";
import { base } from "./airtable";
import { findUserByIdentifier } from "./users";
import { sendEmail } from "./mail";
import { appUrl } from "./verify";

export const RESET_TTL_SECONDS = 15 * 60;

function hash(token: string) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

export async function sendResetLink(identifier: string) {
    const record = await findUserByIdentifier(identifier);
    if (!record) return;
    const f = record.fields as { Email?: string; Name?: string };
    if (!f.Email) return;

    const token = crypto.randomBytes(32).toString("hex");
    await base("Users").update(record.id, {
        ResetToken: hash(token),
        ResetExpires: Date.now() + RESET_TTL_SECONDS * 1000,
    });

    const url = `${appUrl()}/reset?email=${encodeURIComponent(f.Email)}&token=${token}`;
    await sendEmail(
        f.Email,
        "Reset your ACHILLES password",
        `Hi ${f.Name ?? "there"},\n\nWe received a request to reset your password. This link is valid for 15 minutes. If you did not ask for this, you can ignore this email and your password will stay the same.`,
        { heading: "Reset your password", button: { label: "Choose a new password", url } }
    );
}

export async function consumeResetToken(email: string, token: string): Promise<string | null> {
    const record = await findUserByIdentifier(email);
    if (!record) return null;
    const f = record.fields as { ResetToken?: string; ResetExpires?: number };
    if (!f.ResetToken || !f.ResetExpires || Date.now() > f.ResetExpires) return null;

    const given = Buffer.from(hash(token));
    const stored = Buffer.from(f.ResetToken);
    if (given.length !== stored.length || !crypto.timingSafeEqual(given, stored)) return null;
    return record.id;
}

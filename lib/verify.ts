import crypto from "crypto";
import { base } from "./airtable";
import { findUserByEmail } from "./users";
import { sendEmail } from "./mail";

export const VERIFY_TTL_SECONDS = 5 * 60;
const TTL_MS = VERIFY_TTL_SECONDS * 1000;

function hash(token: string) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

// Links in emails (verify, reset) must point at the live site. NEXTAUTH_URL wins when it is a real address;
// on Vercel, a missing or localhost value falls back to the deployment's own domain.
export function appUrl() {
    const explicit = process.env.NEXTAUTH_URL?.trim().replace(/\/$/, "");
    const local = !explicit || /localhost|127\.0\.0\.1/.test(explicit);
    if (local && process.env.VERCEL) {
        const host = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
        if (host) return `https://${host}`;
    }
    return explicit || "http://localhost:3000";
}

export function newVerification() {
    const token = crypto.randomBytes(32).toString("hex");
    return { token, hash: hash(token), expires: Date.now() + TTL_MS };
}

export async function sendVerificationEmail(email: string, name: string, token: string) {
    const url = `${appUrl()}/verify?email=${encodeURIComponent(email)}&token=${token}`;
    await sendEmail(
        email,
        "Verify your ACHILLES account",
        `Hi ${name},\n\nWelcome to ACHILLES! Please confirm your email address to activate your account. This link is valid for 5 minutes.`,
        { heading: "Confirm your email", button: { label: "Verify my email", url } }
    );
}

export async function resendVerification(userId: string, email: string, name: string) {
    const v = newVerification();
    await base("Users").update(userId, { VerifyToken: v.hash, VerifyExpires: v.expires });
    await sendVerificationEmail(email, name, v.token);
}

export async function confirmVerification(email: string, token: string): Promise<"ok" | "expired" | "invalid"> {
    const user = await findUserByEmail(email);
    if (!user) return "invalid";
    const f = user.fields as { VerifyToken?: string; VerifyExpires?: number };
    if (!f.VerifyToken) return "ok";

    const given = Buffer.from(hash(token));
    const stored = Buffer.from(f.VerifyToken);
    if (given.length !== stored.length || !crypto.timingSafeEqual(given, stored)) return "invalid";
    if (!f.VerifyExpires || Date.now() > f.VerifyExpires) return "expired";

    await base("Users").update(user.id, { VerifyToken: "", VerifyExpires: 0 });
    return "ok";
}

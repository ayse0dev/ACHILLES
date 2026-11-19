import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { encode } from "next-auth/jwt";
import { z } from "zod";
import { findUserByIdentifier } from "@/lib/users";
import { generateOTP, sendOtpEmail, verifyOTP } from "@/lib/otp";
import { blockedMinutes, clearFailures, ipFrom, recordFailure } from "@/lib/rateLimit";
import { normalizeRole } from "@/lib/roles";
import { audit } from "@/lib/audit";

const schema = z.object({
    identifier: z.string().trim().min(2).max(120),
    password: z.string().min(1).max(200),
    otp: z.string().trim().max(10).optional(),
});

const THIRTY_DAYS = 30 * 24 * 60 * 60;

function maskEmail(email: string) {
    const [user, domain] = email.split("@");
    return `${user.slice(0, 2)}${"*".repeat(Math.max(1, user.length - 2))}@${domain}`;
}

// Step 1 (no otp): check the password and email a 6-digit code.
// Step 2 (with otp): check password + code and return a bearer token for the app.
export async function POST(request: Request) {
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Enter your email or username and your password." }, { status: 400 });
    const { identifier, password, otp } = parsed.data;

    const accountKey = `acct:${identifier.toLowerCase()}`;
    const ipKey = `ip:${ipFrom(request.headers)}`;
    const wait = Math.max(blockedMinutes(accountKey, 5, 900000), blockedMinutes(ipKey, 20, 900000));
    if (wait > 0) return NextResponse.json({ error: `Too many wrong attempts. Try again in ${wait} minute${wait === 1 ? "" : "s"}.` }, { status: 429 });

    const bad = async () => {
        recordFailure(accountKey);
        recordFailure(ipKey);
        await audit(identifier, "login_failed", "mobile");
        return NextResponse.json({ error: "Invalid email, username or password." }, { status: 401 });
    };

    const record = await findUserByIdentifier(identifier);
    const f = record?.fields as { Email?: string; Name?: string; PasswordHash?: string; Role?: string; VerifyToken?: string } | undefined;
    if (!record || !f?.PasswordHash || !f.Email) return bad();
    if (!(await bcrypt.compare(password, f.PasswordHash))) return bad();
    if (f.VerifyToken) return NextResponse.json({ error: "Please verify your email first. Check your inbox for the verification link." }, { status: 403 });

    const role = normalizeRole(f.Role);
    if (role !== "customer") return NextResponse.json({ error: "Staff and admin accounts must use the website." }, { status: 403 });

    if (!otp) {
        const code = await generateOTP(f.Email);
        if (!code) return bad();
        try {
            await sendOtpEmail(f.Email, code);
        } catch (err) {
            console.error("[mobile login] could not send code:", err);
            return NextResponse.json({ error: "We couldn't send the code email. Please try again." }, { status: 500 });
        }
        return NextResponse.json({ codeSent: true, sentTo: maskEmail(f.Email) });
    }

    if (!(await verifyOTP(f.Email, otp))) {
        recordFailure(accountKey);
        return NextResponse.json({ error: "That code is wrong or expired." }, { status: 401 });
    }
    clearFailures(accountKey);
    await audit(f.Email, "login_success", "mobile");

    const name = f.Name ?? f.Email.split("@")[0];
    const token = await encode({
        token: { id: record.id, email: f.Email, name, role },
        secret: process.env.NEXTAUTH_SECRET as string,
        maxAge: THIRTY_DAYS,
    });
    return NextResponse.json({ token, user: { id: record.id, email: f.Email, name, role } });
}

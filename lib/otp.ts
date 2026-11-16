import nodemailer from "nodemailer";
import crypto from "crypto";
import { base } from "./airtable";
import { findUserByEmail } from "./users";

const CODE_TTL_MS = 5 * 60 * 1000;

export async function generateOTP(email: string): Promise<string | null> {
    const user = await findUserByEmail(email);
    if (!user) return null;

    const code = String(crypto.randomInt(100000, 1000000));
    await base("Users").update(user.id, {
        OtpCode: code,
        OtpExpiresAt: Date.now() + CODE_TTL_MS,
    });
    return code;
}

export async function verifyOTP(email: string, code: string): Promise<boolean> {
    const user = await findUserByEmail(email);
    if (!user) return false;

    const fields = user.fields as { OtpCode?: string; OtpExpiresAt?: number };
    if (!fields.OtpCode || !fields.OtpExpiresAt) return false;
    if (Date.now() > fields.OtpExpiresAt) return false;
    if (fields.OtpCode !== code) return false;

    await base("Users").update(user.id, { OtpCode: "", OtpExpiresAt: 0 });
    return true;
}

export async function sendOtpEmail(email: string, code: string) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },
    });

    await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: email,
        subject: "Your ACHILLES login code",
        text: `Your login verification code is ${code}. It expires in 5 minutes.`,
    });
}

import nodemailer from "nodemailer";
import crypto from "crypto";

// Simple in‑memory OTP store – suitable for dev. In prod you’d use a DB or cache.
interface OtpEntry {
  code: string;
  expires: number; // unix ms
}

const store = new Map<string, OtpEntry>();

export function generateOTP(email: string): string {
  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6‑digit
  const expires = Date.now() + 5 * 60 * 1000; // 5 min
  store.set(email, { code, expires });
  return code;
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
    subject: "Your SoleFix login code",
    text: `Your login verification code is ${code}. It expires in 5 minutes.`,
  });
}

export function verifyOTP(email: string, code: string): boolean {
  const entry = store.get(email);
  if (!entry) return false;
  if (Date.now() > entry.expires) {
    store.delete(email);
    return false;
  }
  const ok = entry.code === code;
  if (ok) store.delete(email);
  return ok;
}


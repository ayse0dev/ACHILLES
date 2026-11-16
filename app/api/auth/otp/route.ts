import { NextResponse } from "next/server";
import { generateOTP, sendOtpEmail } from "@/lib/otp";

export async function POST(request: Request) {
  const { email } = await request.json();
  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const code = await generateOTP(email);
  if (code) {
    try {
      await sendOtpEmail(email, code);
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }
  }

  return NextResponse.json({ message: "OTP sent" });
}

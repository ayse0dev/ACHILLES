import { NextResponse } from "next/server";
import { generateOTP, sendOtpEmail } from "@/lib/otp";

export async function POST(request: Request) {
  const { email } = await request.json();
  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }
  const code = generateOTP(email);
  try {
    await sendOtpEmail(email, code);
    return NextResponse.json({ message: "OTP sent" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}


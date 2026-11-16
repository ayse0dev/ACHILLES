import nodemailer from "nodemailer";

export async function sendEmail(to: string, subject: string, text: string) {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS || !to) return;

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },
    });

    await transporter.sendMail({
        from: `ACHILLES <${process.env.GMAIL_USER}>`,
        to,
        subject,
        text,
    });
}

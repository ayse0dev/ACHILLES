import nodemailer from "nodemailer";

export function isMailConfigured(): boolean {
    return Boolean(process.env.BREVO_SMTP_USER && process.env.BREVO_SMTP_KEY && process.env.MAIL_FROM);
}

export async function sendEmail(to: string, subject: string, text: string) {
    if (!isMailConfigured() || !to) return;

    const transporter = nodemailer.createTransport({
        host: "smtp-relay.brevo.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.BREVO_SMTP_USER,
            pass: process.env.BREVO_SMTP_KEY,
        },
    });

    await transporter.sendMail({
        from: `ACHILLES <${process.env.MAIL_FROM}>`,
        to,
        subject,
        text,
    });
}

import nodemailer from "nodemailer";

export async function sendEmail(to: string, subject: string, text: string) {
    const user = process.env.BREVO_SMTP_USER;
    const pass = process.env.BREVO_SMTP_KEY;
    const from = process.env.MAIL_FROM;
    if (!user || !pass || !from || !to) return;

    const transporter = nodemailer.createTransport({
        host: "smtp-relay.brevo.com",
        port: 587,
        secure: false,
        auth: { user, pass },
    });

    await transporter.sendMail({
        from: `ACHILLES <${from}>`,
        to,
        subject,
        text,
    });
}

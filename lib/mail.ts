import path from "path";
import nodemailer from "nodemailer";
import { renderEmail, EmailOptions } from "./emailTemplate";

export function isMailConfigured(): boolean {
    return Boolean(process.env.BREVO_SMTP_USER && process.env.BREVO_SMTP_KEY && process.env.MAIL_FROM);
}

export async function sendEmail(to: string, subject: string, text: string, options: EmailOptions = {}) {
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
        text: options.button ? `${text}\n\n${options.button.label}: ${options.button.url}` : text,
        html: renderEmail(subject, text, options),
        attachments: [
            {
                filename: "logo.png",
                path: path.join(process.cwd(), "public", "logo-email.png"),
                cid: "achilles-logo",
            },
        ],
    });
}

export type EmailOptions = {
    heading?: string;
    button?: { label: string; url: string };
    code?: string;
};

function escape(value: string) {
    return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function renderEmail(subject: string, text: string, options: EmailOptions = {}): string {
    const paragraphs = text
        .split(/\n{2,}/)
        .map((p) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#1b1340;">${escape(p).replace(/\n/g, "<br>")}</p>`)
        .join("");

    const code = options.code
        ? `<div style="margin:8px 0 24px;text-align:center;"><span style="display:inline-block;padding:14px 28px;border-radius:14px;background:#f3ecfb;color:#8b3fc7;font-size:32px;font-weight:800;letter-spacing:8px;font-family:Consolas,Menlo,monospace;">${escape(options.code)}</span></div>`
        : "";

    const button = options.button
        ? `<div style="margin:8px 0 24px;text-align:center;"><a href="${escape(options.button.url)}" style="display:inline-block;padding:14px 32px;border-radius:999px;background:#8b3fc7;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">${escape(options.button.label)}</a></div><p style="margin:0 0 16px;font-size:12px;line-height:1.5;color:#6b6585;word-break:break-all;">If the button does not work, copy this link into your browser:<br>${escape(options.button.url)}</p>`
        : "";

    return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#faf6f0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf6f0;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #ece4d8;font-family:Helvetica,Arial,sans-serif;">
<tr><td style="background:#1b1340;padding:22px;text-align:center;"><img src="cid:achilles-logo" alt="ACHILLES" width="120" style="display:inline-block;height:auto;border:0;"></td></tr>
<tr><td style="height:5px;line-height:5px;font-size:0;background:linear-gradient(90deg,#19b3c4,#8b3fc7,#ff7a3d,#ffc83d);">&nbsp;</td></tr>
<tr><td style="padding:32px 32px 12px;">
<h1 style="margin:0 0 18px;font-size:24px;line-height:1.25;color:#1b1340;">${escape(options.heading ?? subject)}</h1>
${paragraphs}${code}${button}
</td></tr>
<tr><td style="padding:16px 32px 28px;border-top:1px solid #f0e9df;">
<p style="margin:0;font-size:12px;line-height:1.6;color:#6b6585;text-align:center;">ACHILLES Shoe Repair &amp; Retail<br>Quezon City, Metro Manila, Philippines<br>You received this email because of activity on your ACHILLES account.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

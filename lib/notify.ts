import { base } from "./airtable";

export async function notify(email: string, title: string, body: string, link = "") {
    if (!email) return;
    try {
        await base("Notifications").create({
            Email: email.toLowerCase(),
            Title: title,
            Body: body,
            Link: link,
            Read: false,
            CreatedAt: new Date().toISOString(),
        });
    } catch {
        return;
    }
}

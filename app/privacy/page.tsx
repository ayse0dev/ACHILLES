import { contact } from "@/lib/business";

const sections = [
    {
        title: "What we collect",
        body: "Your name, email, phone number, delivery details, the shoes you send for repair, and your order and repair history. We do not collect more than we need to serve you.",
    },
    {
        title: "Why we collect it",
        body: "To create your account, process shop orders and repair requests, send confirmations and updates, give support, and meet legal and accounting duties.",
    },
    {
        title: "Payments",
        body: "Card and e-wallet payments are handled by our payment provider on its own secure page. ACHILLES never sees or stores your card number.",
    },
    {
        title: "Who sees your data",
        body: "Only the ACHILLES team members who need it to do their job, and service providers that run the site, send email and process payments. We do not sell your data.",
    },
    {
        title: "How long we keep it",
        body: "Account, order and repair records are kept while your account is active and for as long as the law requires for accounting. Support tickets and messages are kept for up to 2 years.",
    },
    {
        title: "How we protect it",
        body: "Connections are encrypted, passwords are stored hashed, logins need an emailed one-time code, staff access is limited by role, and staff actions are logged.",
    },
    {
        title: "Your rights under RA 10173",
        body: "You may ask to see, correct, export or delete your personal data, withdraw consent, or object to processing. You may also file a complaint with the National Privacy Commission.",
    },
    {
        title: "Data breaches",
        body: "If a breach puts your personal data at risk, we will notify affected customers and the National Privacy Commission within the period required by law.",
    },
];

export default function PrivacyPage() {
    return (
        <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
            <div>
                <p className="eyebrow mb-2">Legal</p>
                <h1 className="page-title">Privacy Policy</h1>
                <p className="text-ink/70 mt-2">How ACHILLES handles your personal data under the Philippine Data Privacy Act (RA 10173).</p>
            </div>
            {sections.map((s) => (
                <section key={s.title} className="card p-6 space-y-2">
                    <h2 className="font-black uppercase">{s.title}</h2>
                    <p className="text-ink/80">{s.body}</p>
                </section>
            ))}
            <p className="text-sm text-ink/70">
                Questions or requests: contact us through the <a href="/contact" className="underline">contact page</a>
                {contact.address ? ` or visit ${contact.address}` : ""}.
            </p>
        </div>
    );
}

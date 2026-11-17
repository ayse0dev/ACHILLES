import Link from "next/link";
import { confirmVerification } from "@/lib/verify";

export const dynamic = "force-dynamic";

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ email?: string; token?: string }> }) {
    const { email, token } = await searchParams;
    const result = email && token ? await confirmVerification(email, token) : "invalid";

    const copy = {
        ok: { title: "Email verified", text: "Your account is active. You can log in now.", action: "Log in", href: "/login" },
        expired: {
            title: "Link expired",
            text: "This verification link is no longer valid. Try logging in and we will send you a new one.",
            action: "Go to log in",
            href: "/login",
        },
        invalid: {
            title: "Link not valid",
            text: "This verification link is not valid. Try logging in and we will send you a fresh one.",
            action: "Go to log in",
            href: "/login",
        },
    }[result];

    return (
        <div className="max-w-md mx-auto px-4 py-16">
            <div className="card p-8 text-center space-y-4">
                <p className="eyebrow">Account</p>
                <h1 className="page-title !text-3xl">{copy.title}</h1>
                <p className="text-ink/70">{copy.text}</p>
                <Link href={copy.href} className="btn btn-accent">
                    {copy.action}
                </Link>
            </div>
        </div>
    );
}

import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

const APK_URL = process.env.NEXT_PUBLIC_APK_URL ?? "";

export default async function DownloadPage() {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
    const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
    const siteUrl = `${proto}://${host}`;
    const qrTarget = `${siteUrl}/get`;

    return (
        <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-8">
            <div>
                <p className="eyebrow mb-2">Take ACHILLES with you</p>
                <h1 className="page-title">Get the mobile app</h1>
                <p className="text-ink/70 mt-3">Scan the QR code with your phone camera, or choose your phone below.</p>
            </div>

            <div className="flex justify-center">
                <div className="card p-5">
                    <QRCodeSVG value={qrTarget} size={200} />
                </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-left">
                <div className="border-2 border-ink p-5 space-y-3">
                    <h2 className="font-black uppercase">Android</h2>
                    {APK_URL ? (
                        <a href={APK_URL} download className="btn btn-ink w-full justify-center">Download app (.apk)</a>
                    ) : (
                        <p className="text-sm font-bold text-orange">Download coming soon.</p>
                    )}
                    <p className="text-xs text-ink/60">Open the file after downloading and allow &ldquo;Install unknown apps&rdquo; if asked.</p>
                </div>
                <div className="border-2 border-ink p-5 space-y-3">
                    <h2 className="font-black uppercase">iPhone</h2>
                    <p className="text-sm text-ink/70">Open this site in Safari, tap Share, then <b>Add to Home Screen</b>.</p>
                    <Link href="/get" className="underline font-bold text-sm">See the steps</Link>
                </div>
            </div>
        </div>
    );
}

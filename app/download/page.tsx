import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";

export default function DownloadPage() {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const qrTarget = `${siteUrl}/get`;

    return (
        <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-8">
            <div>
                <p className="eyebrow mb-2">Take ACHILLES with you</p>
                <h1 className="page-title">Get the mobile app</h1>
                <p className="text-ink/70 mt-3">
                    Scan the QR code with your phone camera, or tap a button below.
                </p>
            </div>

            <div className="flex justify-center">
                <div className="card p-5">
                    <QRCodeSVG value={qrTarget} size={200} />
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href={process.env.NEXT_PUBLIC_APP_STORE_URL} className="btn btn-ink">
                    Download on the App Store
                </a>
                <a href={process.env.NEXT_PUBLIC_PLAY_STORE_URL} className="btn btn-accent">
                    Get it on Google Play
                </a>
            </div>

            <p className="text-sm text-ink/60">
                On your phone? <Link href="/get" className="underline font-bold">Tap here</Link> and we&apos;ll redirect you automatically.
            </p>
        </div>
    );
}

import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";

export default function DownloadPage() {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const qrTarget = `${siteUrl}/get`;

    return (
        <div className="max-w-2xl mx-auto p-6 text-center space-y-6">
            <h1 className="text-3xl font-bold">Get the SoleFix mobile app</h1>
            <p className="text-gray-600">
                Scan the QR code with your phone camera, or tap a button below.
            </p>

            <div className="flex justify-center">
                <div className="p-4 bg-white border rounded-lg">
                    <QRCodeSVG value={qrTarget} size={200} />
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                    href={process.env.NEXT_PUBLIC_APP_STORE_URL}
                    className="bg-black text-white px-6 py-3 rounded-lg"
                >
                    Download on the App Store
                </a>
                <a
                    href={process.env.NEXT_PUBLIC_PLAY_STORE_URL}
                    className="bg-green-700 text-white px-6 py-3 rounded-lg"
                >
                    Get it on Google Play
                </a>
            </div>

            <p className="text-sm text-gray-500">
                On your phone? <Link href="/get" className="underline">Tap here</Link> and we'll redirect you automatically.
            </p>
        </div>
    );
}
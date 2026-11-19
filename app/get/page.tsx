import { headers } from "next/headers";
import Link from "next/link";

export const dynamic = "force-dynamic";

const APK_URL = process.env.NEXT_PUBLIC_APK_URL ?? "/achilles.apk";

export default async function GetAppPage() {
    const ua = (await headers()).get("user-agent") ?? "";
    const android = /android/i.test(ua);
    const ios = /iphone|ipad|ipod/i.test(ua);

    return (
        <div className="max-w-xl mx-auto px-4 py-12 space-y-8">
            <div className="text-center">
                <p className="eyebrow mb-2">Take ACHILLES with you</p>
                <h1 className="page-title">Install the app</h1>
                <p className="text-ink/70 mt-3">Shop shoes, check out and follow your orders from your phone.</p>
            </div>

            {(android || !ios) && (
                <section className="border-2 border-ink p-6 space-y-4">
                    <h2 className="font-black uppercase text-lg">Android</h2>
                    {APK_URL ? (
                        <a href={APK_URL} className="btn btn-ink w-full justify-center" download>
                            Download the Android app (.apk)
                        </a>
                    ) : (
                        <p className="text-sm font-bold text-orange">The Android download is almost ready. Check back soon.</p>
                    )}
                    <ol className="text-sm text-ink/70 list-decimal pl-5 space-y-1">
                        <li>Tap the download button and open the file.</li>
                        <li>If asked, allow &ldquo;Install unknown apps&rdquo; for your browser.</li>
                        <li>Tap Install, then open ACHILLES.</li>
                    </ol>
                </section>
            )}

            {(ios || !android) && (
                <section className="border-2 border-ink p-6 space-y-4">
                    <h2 className="font-black uppercase text-lg">iPhone and iPad</h2>
                    <ol className="text-sm text-ink/70 list-decimal pl-5 space-y-1">
                        <li>Open this website in <b>Safari</b>.</li>
                        <li>Tap the Share button.</li>
                        <li>Choose <b>Add to Home Screen</b>, then tap Add.</li>
                    </ol>
                    <p className="text-xs text-ink/50">ACHILLES opens full-screen from your home screen, just like an app.</p>
                </section>
            )}

            <p className="text-center text-sm">
                <Link href="/" className="underline font-bold">Back to the shop</Link>
            </p>
        </div>
    );
}

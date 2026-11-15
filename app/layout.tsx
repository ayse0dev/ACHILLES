import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/Navbar";
import ChatWidget from "@/components/ChatWidget";

export const metadata = {
    title: "SoleFix — Shop & Repair Shoes",
    description: "Buy shoes and get them repaired. Download our mobile app.",
    manifest: "/manifest.webmanifest",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <Providers>
                    <Navbar />
                    <main className="min-h-screen">{children}</main>
                    <ChatWidget />
                </Providers>
            </body>
        </html>
    );
}
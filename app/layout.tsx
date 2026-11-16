import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/Navbar";
import AnnouncementBar from "@/components/AnnouncementBar";
import ChatWidget from "@/components/ChatWidget";
import Footer from "@/components/Footer";
import ScrollMotion from "@/components/ScrollMotion";

export const metadata = {
    title: "ACHILLES — Shop & Repair Shoes",
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
                    <AnnouncementBar />
                    <Navbar />
                    <ScrollMotion />
                    <main className="min-h-screen">{children}</main>
                    <ChatWidget />
                    <Footer />
                </Providers>
            </body>
        </html>
    );
}

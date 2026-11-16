"use client";

import { usePathname } from "next/navigation";

export default function HideOnDashboard({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    if (pathname.startsWith("/admin") || pathname.startsWith("/staff")) return null;
    return <>{children}</>;
}

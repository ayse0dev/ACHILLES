"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
    const { data: session, status } = useSession();

    return (
        <nav className="border-b px-6 py-3 flex items-center justify-between">
            <div className="flex gap-6 items-center">
                <Link href="/" className="font-bold text-lg">
                    SoleFix
                </Link>
                <Link href="/shop" className="hover:underline">
                    Shop
                </Link>
                <Link href="/repair" className="hover:underline">
                    Repair
                </Link>
                <Link href="/download" className="hover:underline">
                    Get App
                </Link>
            </div>
            <div className="flex gap-4 items-center">
                {status === "loading" ? null : session?.user ? (
                    <>
                        <span className="text-sm text-gray-600">
                            {session.user.name ?? session.user.email}
                        </span>
                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="text-sm underline"
                        >
                            Log out
                        </button>
                    </>
                ) : (
                    <>
                        <Link href="/login" className="text-sm underline">
                            Log in
                        </Link>
                        <Link
                            href="/register"
                            className="text-sm bg-black text-white px-3 py-1.5 rounded"
                        >
                            Register
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}
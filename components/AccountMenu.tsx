"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

export default function AccountMenu({ userId, name, email, role }: { userId: string; name: string; email: string; role: string }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const [version, setVersion] = useState(() => Date.now());
    const [broken, setBroken] = useState(false);

    useEffect(() => {
        const bump = () => {
            setBroken(false);
            setVersion(Date.now());
        };
        window.addEventListener("avatar-updated", bump);
        return () => window.removeEventListener("avatar-updated", bump);
    }, []);

    useEffect(() => {
        function onClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") setOpen(false);
        }
        document.addEventListener("mousedown", onClick);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onClick);
            document.removeEventListener("keydown", onKey);
        };
    }, []);

    const initial = (name || email || "?").charAt(0).toUpperCase();
    const item = "block w-full text-left px-4 py-2 text-sm font-bold rounded-xl hover:bg-ink/5";

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen((v) => !v)}
                aria-label="Account menu"
                aria-expanded={open}
                className="w-10 h-10 rounded-full bg-purple text-white font-black flex items-center justify-center overflow-hidden"
            >
                {userId && !broken ? (
                    <img src={`/api/avatar/${userId}?v=${version}`} alt="" className="w-full h-full object-cover" onError={() => setBroken(true)} />
                ) : (
                    initial
                )}
            </button>
            {open && (
                <div className="absolute right-0 mt-2 w-64 card p-2 z-50" role="menu">
                    <div className="px-4 py-3 border-b border-ink/10 mb-1">
                        <p className="font-black truncate">{name}</p>
                        <p className="text-xs text-ink/60 truncate">{email}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wide text-purple mt-1">{role}</p>
                    </div>
                    <Link href="/profile" onClick={() => setOpen(false)} className={item} role="menuitem">
                        Profile management
                    </Link>
                    <Link href="/settings" onClick={() => setOpen(false)} className={item} role="menuitem">
                        Settings
                    </Link>
                    <button onClick={() => signOut({ callbackUrl: "/" })} className={`${item} text-red`} role="menuitem">
                        Log out
                    </button>
                </div>
            )}
        </div>
    );
}

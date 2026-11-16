"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toggleWishlist } from "@/app/wishlist/actions";

export default function WishlistButton({
    slug,
    initialSaved,
    loggedIn,
}: {
    slug: string;
    initialSaved: boolean;
    loggedIn: boolean;
}) {
    const [saved, setSaved] = useState(initialSaved);
    const [error, setError] = useState("");
    const [pending, startTransition] = useTransition();

    if (!loggedIn) {
        return (
            <Link href="/login" className="btn btn-ghost w-full">
                Log in to save this shoe
            </Link>
        );
    }

    function handleClick() {
        setError("");
        startTransition(async () => {
            const result = await toggleWishlist(slug);
            if (result.error) setError(result.error);
            else if (result.saved !== undefined) setSaved(result.saved);
        });
    }

    return (
        <div className="space-y-2">
            <button onClick={handleClick} disabled={pending} className="btn btn-ghost w-full">
                {pending ? "Saving" : saved ? "Saved to wishlist" : "Save to wishlist"}
            </button>
            {error && <p className="text-red text-sm">{error}</p>}
        </div>
    );
}

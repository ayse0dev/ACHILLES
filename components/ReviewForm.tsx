"use client";

import Link from "next/link";
import { useActionState } from "react";
import { submitReview, ReviewState } from "@/app/reviews/actions";

const initial: ReviewState = {};

export default function ReviewForm({ loggedIn }: { loggedIn: boolean }) {
    const [state, formAction, isPending] = useActionState(submitReview, initial);

    if (state.success) {
        return <p className="font-bold">Thanks! Your review will appear once it&apos;s approved.</p>;
    }

    if (!loggedIn) {
        return (
            <div className="space-y-3">
                <p className="font-black uppercase">Leave a review</p>
                <p className="text-ink/70">You need to be logged in to leave a review.</p>
                <Link href="/login?callbackUrl=/reviews" className="btn btn-ink">Log in</Link>
            </div>
        );
    }

    return (
        <form action={formAction} className="space-y-3">
            <p className="font-black uppercase">Leave a review</p>
            <select name="rating" required defaultValue="" className="field">
                <option value="" disabled>Choose a rating</option>
                <option value="5">5 — Excellent</option>
                <option value="4">4 — Good</option>
                <option value="3">3 — Okay</option>
                <option value="2">2 — Poor</option>
                <option value="1">1 — Terrible</option>
            </select>
            <textarea name="comment" required rows={4} placeholder="How did your repair turn out?" className="field" />
            <input name="photoUrl" type="url" placeholder="Photo URL of the repaired shoe (optional)" className="field" />
            {state.error && <p className="text-red text-sm">{state.error}</p>}
            <button disabled={isPending} className="btn btn-accent w-full">
                {isPending ? "Sending..." : "Submit review"}
            </button>
        </form>
    );
}

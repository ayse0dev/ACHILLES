"use server";

import { base } from "@/lib/airtable";
import { getCurrentUser } from "@/lib/session";
import { z } from "zod";

const schema = z.object({
    rating: z.coerce.number().int().min(1).max(5),
    comment: z.string().min(10).max(1000),
    photoUrl: z.string().url().optional().or(z.literal("")),
});

export type ReviewState = { error?: string; success?: boolean };

export async function submitReview(_prev: ReviewState, formData: FormData): Promise<ReviewState> {
    const user = await getCurrentUser();
    if (!user) return { error: "Log in to leave a review." };

    const parsed = schema.safeParse({
        rating: formData.get("rating"),
        comment: formData.get("comment"),
        photoUrl: formData.get("photoUrl") ?? "",
    });
    if (!parsed.success) {
        return { error: "Choose a rating and write at least 10 characters." };
    }

    await base("Reviews").create({
        Name: user.name ?? user.email.split("@")[0],
        Email: user.email,
        Rating: parsed.data.rating,
        Comment: parsed.data.comment,
        PhotoUrl: parsed.data.photoUrl || undefined,
        Approved: false,
        CreatedAt: new Date().toISOString(),
    });

    return { success: true };
}

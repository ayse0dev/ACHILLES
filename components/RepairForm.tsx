"use client";

import { useState } from "react";
import { submitRepair, RepairState } from "@/app/repair/actions";
import { useActionState } from "react";


async function uploadToCloudinary(file: File) {
    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET!);

    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD}/image/upload`,
        { method: "POST", body: form }
    );
    const data = await res.json();
    return data.secure_url as string;
}

const initial: RepairState = {};

export default function RepairForm() {
    const [state, formAction, isPending] = useActionState(submitRepair, initial);

    const [photoUrl, setPhotoUrl] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const url = await uploadToCloudinary(file);
            setPhotoUrl(url);
        } catch (err) {
            alert("Failed to upload image. Please try again.");
        } finally {
            setIsUploading(false);
        }
    }

    if (state.success) {
        return (
            <div className="max-w-md mx-auto p-6">
                <h1 className="text-2xl font-bold mb-2">Request received!</h1>
                <p>We'll email you within 24 hours with a quote.</p>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto p-6 space-y-4">
            <h1 className="text-2xl font-bold">Request a shoe repair</h1>

            <form action={formAction} className="space-y-3">

                <div>
                    <label className="block text-sm mb-1">Upload Photo (optional)</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full border rounded px-3 py-2"
                    />
                    {isUploading && <p className="text-sm text-blue-500">Uploading image...</p>}
                    {photoUrl && <p className="text-sm text-green-600">Image uploaded successfully!</p>}
                </div>

                <input type="hidden" name="photoUrl" value={photoUrl} />

                {state.error && <p className="text-red-600 text-sm">{state.error}</p>}

                <button
                    disabled={isPending || isUploading}
                    className="w-full bg-black text-white rounded py-2 disabled:opacity-50"
                >
                    {isPending ? "Submitting..." : "Submit request"}
                </button>
            </form>
        </div>
    );
}
"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { saveAvatar, DeliveryState } from "@/app/account/delivery";

const initial: DeliveryState = {};
const SIZE = 256;

function toJpeg(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            const side = Math.min(img.width, img.height);
            const canvas = document.createElement("canvas");
            canvas.width = SIZE;
            canvas.height = SIZE;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
                URL.revokeObjectURL(url);
                reject(new Error("no canvas"));
                return;
            }
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, SIZE, SIZE);
            ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, SIZE, SIZE);
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL("image/jpeg", 0.8));
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("bad image"));
        };
        img.src = url;
    });
}

export default function AvatarUploader({ userId, name, hasAvatar }: { userId: string; name: string; hasAvatar: boolean }) {
    const [state, action, pending] = useActionState(saveAvatar, initial);
    const [preview, setPreview] = useState("");
    const [version] = useState(() => Date.now());
    const [removed, setRemoved] = useState(false);
    const [error, setError] = useState("");
    const [processing, setProcessing] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const hidden = useRef<HTMLInputElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (state.success) {
            window.dispatchEvent(new CustomEvent("avatar-updated"));
        }
    }, [state]);

    async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        setError("");
        if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 8 * 1024 * 1024) {
            setError("Choose a JPG, PNG or WebP photo under 8 MB.");
            return;
        }
        setProcessing(true);
        try {
            const dataUrl = await toJpeg(file);
            setPreview(dataUrl);
            setRemoved(false);
            if (hidden.current) hidden.current.value = dataUrl;
            formRef.current?.requestSubmit();
        } catch {
            setError("We could not read that photo. Try another one.");
        } finally {
            setProcessing(false);
        }
    }

    const initialLetter = (name || "?").charAt(0).toUpperCase();
    const src = preview || (hasAvatar && !removed ? `/api/avatar/${userId}?v=${version}` : "");

    return (
        <form ref={formRef} action={action} className="card p-6 flex items-center gap-5">
            <input ref={hidden} type="hidden" name="avatar" />
            <div className="w-24 h-24 rounded-full overflow-hidden bg-purple text-white text-4xl font-black flex items-center justify-center shrink-0 border-2 border-ink">
                {src ? <img src={src} alt="Your profile" className="w-full h-full object-cover" onError={() => setPreview("")} /> : initialLetter}
            </div>
            <div className="space-y-2 min-w-0">
                <p className="font-display font-bold text-xl">Profile picture</p>
                <p className="text-xs text-ink/60">JPG, PNG or WebP. It is cropped to a square automatically.</p>
                <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => fileRef.current?.click()} disabled={pending || processing} className="btn btn-ink !py-2 !px-4 text-sm">
                        {processing || pending ? "Uploading..." : src ? "Change photo" : "Upload photo"}
                    </button>
                    {src && (
                        <button
                            name="remove"
                            value="1"
                            disabled={pending}
                            onClick={() => {
                                setPreview("");
                                setRemoved(true);
                            }}
                            className="btn btn-ghost !py-2 text-sm"
                        >
                            Remove
                        </button>
                    )}
                </div>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onPick} className="hidden" />
                {(error || state.error) && <p className="text-red text-xs">{error || state.error}</p>}
                {state.success && !error && <p className="text-teal text-xs font-bold">Saved.</p>}
            </div>
        </form>
    );
}

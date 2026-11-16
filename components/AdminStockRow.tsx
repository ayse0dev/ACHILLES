"use client";

import { useActionState } from "react";
import { adjustStock, AdminState } from "@/app/admin/actions";

const initial: AdminState = {};

export default function AdminStockRow({
    slug,
    name,
    stock,
}: {
    slug: string;
    name: string;
    stock: number;
}) {
    const [state, formAction, isPending] = useActionState(adjustStock, initial);
    const low = stock <= 3;

    return (
        <form action={formAction} className="card p-4 grid md:grid-cols-[2fr_1fr_1.5fr_auto] gap-4 items-center">
            <input type="hidden" name="slug" value={slug} />
            <div>
                <p className="font-bold">{name}</p>
                <p className={`text-xs font-bold uppercase ${low ? "text-orange" : "text-ink/60"}`}>
                    {stock} in stock{low ? " · low" : ""}
                </p>
            </div>
            <input name="change" type="number" step="1" placeholder="+ in / − out" required className="field !py-2" />
            <input name="note" placeholder="Note (supplier, reason)" className="field !py-2" />
            <div className="space-y-1">
                <button disabled={isPending} className="btn btn-ink !py-2 !px-5 text-xs uppercase">
                    {isPending ? "Saving" : "Update"}
                </button>
                {state.error && <p className="text-xs text-red">{state.error}</p>}
            </div>
        </form>
    );
}

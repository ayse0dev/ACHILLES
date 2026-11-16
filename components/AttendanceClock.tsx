"use client";

import { useActionState } from "react";
import { clockAttendance, AdminState } from "@/app/admin/actions";

const initial: AdminState = {};

export default function AttendanceClock() {
    const [state, formAction, isPending] = useActionState(clockAttendance, initial);

    return (
        <form action={formAction} className="card p-5 flex flex-wrap items-center gap-3">
            <p className="font-black uppercase mr-auto">My attendance</p>
            <button name="mode" value="in" disabled={isPending} className="btn btn-accent !py-2 !px-5 text-xs uppercase">
                Clock in
            </button>
            <button name="mode" value="out" disabled={isPending} className="btn btn-ink !py-2 !px-5 text-xs uppercase">
                Clock out
            </button>
            {state.error && <p className="text-xs text-red w-full">{state.error}</p>}
            {state.success && <p className="text-xs text-teal font-bold w-full">Saved.</p>}
        </form>
    );
}

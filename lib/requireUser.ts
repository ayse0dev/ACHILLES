import { redirect } from "next/navigation";
import { getCurrentUser } from "./session";

export async function requireUser(returnTo: string) {
    const user = await getCurrentUser();
    if (!user) {
        redirect(`/login?callbackUrl=${encodeURIComponent(returnTo)}`);
    }
    return user;
}

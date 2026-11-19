import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { headers } from "next/headers";
import { base } from "./airtable";
import { userFromBearer } from "./mobileAuth";

// A deleted account must lose access right away, not when its login token expires.
// Existence is re-checked at most once a minute per account.
const checkedAt = new Map<string, number>();
const RECHECK_MS = 60_000;

async function accountStillExists(id: string): Promise<boolean> {
    const last = checkedAt.get(id);
    if (last && Date.now() - last < RECHECK_MS) return true;
    try {
        await base("Users").find(id);
        checkedAt.set(id, Date.now());
        return true;
    } catch (err) {
        if ((err as { statusCode?: number })?.statusCode === 404) {
            checkedAt.delete(id);
            return false;
        }
        return true;
    }
}

export type CurrentUser = {
    id: string;
    email: string;
    name?: string;
    role: string;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
    const session = await getServerSession(authOptions);
    let user = session?.user as
        | { id?: string; email?: string | null; name?: string | null; role?: string }
        | undefined;
    if (!user?.id) {
        const bearer = await userFromBearer((await headers()).get("authorization")).catch(() => null);
        if (bearer) user = bearer;
    }
    if (!user?.id || !user.email) return null;
    if (!(await accountStillExists(user.id))) return null;
    return {
        id: user.id,
        email: user.email,
        name: user.name ?? undefined,
        role: user.role ?? "customer",
    };
}

import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export type CurrentUser = {
    id: string;
    email: string;
    name?: string;
    role: string;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
    const session = await getServerSession(authOptions);
    const user = session?.user as
        | { id?: string; email?: string | null; name?: string | null; role?: string }
        | undefined;
    if (!user?.id || !user.email) return null;
    return {
        id: user.id,
        email: user.email,
        name: user.name ?? undefined,
        role: user.role ?? "customer",
    };
}

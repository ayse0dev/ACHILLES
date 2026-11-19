import { getToken } from "next-auth/jwt";

// Lets the mobile app authenticate with "Authorization: Bearer <token>" instead of a browser cookie.
export async function userFromBearer(authorization: string | null) {
    if (!authorization?.startsWith("Bearer ")) return null;
    const token = await getToken({
        req: { cookies: {}, headers: { authorization } } as never,
        secret: process.env.NEXTAUTH_SECRET,
    }).catch(() => null);
    if (!token?.id || !token.email) return null;
    return {
        id: String(token.id),
        email: String(token.email),
        name: token.name ? String(token.name) : undefined,
        role: String(token.role ?? "customer"),
    };
}

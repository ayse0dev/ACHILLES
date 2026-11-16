import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const adminAllowed = ["/admin", "/profile", "/settings"];

export async function proxy(request: NextRequest) {
    if (process.env.NODE_ENV === "production" && request.headers.get("x-forwarded-proto") === "http") {
        const secure = request.nextUrl.clone();
        secure.protocol = "https:";
        return NextResponse.redirect(secure, 308);
    }

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const role = String(token?.role ?? "").toLowerCase();

    if (role === "admin") {
        const path = request.nextUrl.pathname;
        const allowed = adminAllowed.some((p) => path === p || path.startsWith(`${p}/`));
        if (!allowed) {
            return NextResponse.redirect(new URL("/admin", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};

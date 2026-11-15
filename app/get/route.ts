export function GET(request: Request) {
    const ua = request.headers.get("user-agent") ?? "";
    const appStore = process.env.NEXT_PUBLIC_APP_STORE_URL!;
    const playStore = process.env.NEXT_PUBLIC_PLAY_STORE_URL!;

    if (/iphone|ipod/i.test(ua)) {
        return Response.redirect(appStore, 302);
    }
    if (/android/i.test(ua)) {
        return Response.redirect(playStore, 302);
    }
    // Desktop or iPad → show download page
    return Response.redirect(new URL("/download", request.url), 302);
}
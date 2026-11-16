import { requireUser } from "@/lib/requireUser";

export default async function Layout({ children }: { children: React.ReactNode }) {
    await requireUser("/shop");
    return <>{children}</>;
}

import Link from "next/link";
import ResetForm from "@/components/ResetForm";

export const dynamic = "force-dynamic";

export default async function ResetPage({ searchParams }: { searchParams: Promise<{ email?: string; token?: string }> }) {
    const { email, token } = await searchParams;

    return (
        <div className="max-w-md mx-auto px-4 py-12">
            <div className="card p-8 space-y-5">
                <div>
                    <p className="eyebrow mb-1">Account help</p>
                    <h1 className="page-title !text-3xl">Choose a new password</h1>
                </div>
                {email && token ? (
                    <ResetForm email={email} token={token} />
                ) : (
                    <div className="space-y-3">
                        <p className="text-ink/70 text-sm">This reset link is not valid.</p>
                        <Link href="/forgot" className="btn btn-ink">Request a new link</Link>
                    </div>
                )}
            </div>
        </div>
    );
}

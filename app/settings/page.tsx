import { requireUser } from "@/lib/requireUser";
import PasswordForm from "@/components/PasswordForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
    await requireUser("/settings");

    return (
        <div className="max-w-xl mx-auto px-4 py-10 space-y-6">
            <div>
                <p className="eyebrow mb-2">Your account</p>
                <h1 className="page-title">Settings</h1>
            </div>
            <PasswordForm />
        </div>
    );
}

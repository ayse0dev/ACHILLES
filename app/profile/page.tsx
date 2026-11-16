import { requireUser } from "@/lib/requireUser";
import ProfileForm from "@/components/ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
    const user = await requireUser("/profile");

    return (
        <div className="max-w-xl mx-auto px-4 py-10 space-y-6">
            <div>
                <p className="eyebrow mb-2">Your account</p>
                <h1 className="page-title">Profile management</h1>
            </div>
            <ProfileForm name={user.name ?? ""} email={user.email} role={user.role} />
        </div>
    );
}

import { requireUser } from "@/lib/requireUser";
import ProfileForm from "@/components/ProfileForm";
import { base } from "@/lib/airtable";
import DeliveryProfile from "@/components/DeliveryProfile";
import { listAddresses } from "@/lib/addresses";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
    const user = await requireUser("/profile");
    const record = await base("Users").find(user.id);
    const fields = record.fields as { Username?: string; Phone?: string; BankName?: string; BankHolder?: string; BankLast4?: string };
    const username = String(fields.Username ?? "");
    const addresses = await listAddresses(user.email);

    return (
        <div className="max-w-xl mx-auto px-4 py-10 space-y-6">
            <div>
                <p className="eyebrow mb-2">Your account</p>
                <h1 className="page-title">Profile management</h1>
            </div>
            <ProfileForm name={user.name ?? ""} username={username} email={user.email} role={user.role} />
            <DeliveryProfile
                phone={fields.Phone ?? ""}
                addresses={addresses}
                bank={{ name: fields.BankName ?? "", holder: fields.BankHolder ?? "", last4: fields.BankLast4 ?? "" }}
            />
        </div>
    );
}

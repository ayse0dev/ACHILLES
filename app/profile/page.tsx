import { requireUser } from "@/lib/requireUser";
import ProfileForm from "@/components/ProfileForm";
import AvatarUploader from "@/components/AvatarUploader";
import { AddressSection, BankSection, PhoneSection } from "@/components/DeliveryProfile";
import PasswordForm from "@/components/PasswordForm";
import TransactionHistory from "@/components/TransactionHistory";
import { base } from "@/lib/airtable";
import { listAddresses } from "@/lib/addresses";
import { isStaff } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
    const user = await requireUser("/profile");
    const record = await base("Users").find(user.id);
    const fields = record.fields as { Username?: string; Phone?: string; BankName?: string; BankHolder?: string; BankLast4?: string; Avatar?: string };
    const username = String(fields.Username ?? "");
    const addresses = await listAddresses(user.email);
    const staff = isStaff(user.role);

    const flat = "[&_.card]:!rounded-none [&_.card]:!shadow-none [&_.card]:!border-0 [&_.card]:!bg-transparent [&_.card]:!p-8";

    return (
        <div className="w-full min-h-[calc(100vh-4rem)] bg-white pb-24 -mb-24">
            <div className={`grid lg:grid-cols-[1.05fr_1fr_1.25fr] gap-0 divide-ink/10 ${flat}`}>
                <header className="lg:col-span-3 bg-white text-ink px-8 py-7 flex flex-wrap items-end justify-between gap-3 border-b border-ink/10">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink/50 mb-1">Your account</p>
                        <h1 className="font-display font-black text-4xl md:text-5xl leading-none">Profile management</h1>
                    </div>
                    <p className="text-sm text-ink/60">{user.email} · <span className="uppercase font-bold text-ink">{user.role}</span></p>
                </header>

                <section className="bg-white lg:row-span-2 lg:border-r border-ink/10">
                    <AvatarUploader userId={user.id} name={user.name ?? ""} hasAvatar={!!fields.Avatar} />
                    <ProfileForm name={user.name ?? ""} username={username} email={user.email} role={user.role} />
                </section>

                <div className="bg-white flex flex-col self-start">
                    <section>
                        <PhoneSection phone={fields.Phone ?? ""} />
                    </section>

                    <section>
                        <BankSection bank={fields.BankName ?? ""} holder={fields.BankHolder ?? ""} last4={fields.BankLast4 ?? ""} />
                    </section>

                    <section>
                        <PasswordForm />
                    </section>
                </div>

                <section className="bg-white lg:row-span-2">
                    <AddressSection addresses={addresses} />
                </section>

                {!staff && (
                    <section className="bg-white lg:col-span-3">
                        <TransactionHistory email={user.email} userId={user.id} />
                    </section>
                )}
            </div>
        </div>
    );
}

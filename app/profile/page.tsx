import { requireUser } from "@/lib/requireUser";
import ProfileForm from "@/components/ProfileForm";
import AvatarUploader from "@/components/AvatarUploader";
import { AddressSection, BankSection, PhoneSection } from "@/components/DeliveryProfile";
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

    const flat = "[&_.card]:!rounded-none [&_.card]:!shadow-none [&_.card]:!bg-transparent [&_.card]:!p-8";

    return (
        <div className="w-full min-h-[calc(100vh-4rem)] bg-ink border-y-2 border-ink">
            <div className={`grid lg:grid-cols-[1.05fr_1fr_1.25fr] gap-[2px] ${flat}`}>
                <header className="lg:col-span-3 bg-ink text-white px-8 py-7 flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow mb-1">Your account</p>
                        <h1 className="font-display font-black text-4xl md:text-5xl leading-none">Profile management</h1>
                    </div>
                    <p className="text-sm text-white/70">{user.email} · <span className="uppercase font-bold text-teal">{user.role}</span></p>
                </header>

                <section className="bg-[#e3f6f8] lg:row-span-2">
                    <AvatarUploader userId={user.id} name={user.name ?? ""} hasAvatar={!!fields.Avatar} />
                    <ProfileForm name={user.name ?? ""} username={username} email={user.email} role={user.role} />
                </section>

                <section className="bg-[#fff4d6]">
                    <PhoneSection phone={fields.Phone ?? ""} />
                </section>

                <section className="bg-[#f1e6fa] lg:row-span-2">
                    <AddressSection addresses={addresses} />
                </section>

                <section className="bg-[#ffe9dc]">
                    <BankSection bank={fields.BankName ?? ""} holder={fields.BankHolder ?? ""} last4={fields.BankLast4 ?? ""} />
                </section>

                {!staff && (
                    <section className="bg-[#faf8f5] lg:col-span-3">
                        <TransactionHistory email={user.email} userId={user.id} />
                    </section>
                )}
            </div>
        </div>
    );
}

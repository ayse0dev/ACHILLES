import { requireUser } from "@/lib/requireUser";
import { base } from "@/lib/airtable";
import { listAddresses } from "@/lib/addresses";
import { shopBank } from "@/lib/business";
import CheckoutForm from "@/components/CheckoutForm";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
    const user = await requireUser("/checkout");
    const record = await base("Users").find(user.id);
    const phone = String((record.fields as { Phone?: string }).Phone ?? "");
    const addresses = await listAddresses(user.email);

    return (
        <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
            <div>
                <p className="eyebrow mb-2">Almost there</p>
                <h1 className="page-title">Delivery & payment</h1>
            </div>
            <CheckoutForm
                profilePhone={phone}
                addresses={addresses}
                bankReady={!!shopBank.accountNumber}
            />
        </div>
    );
}

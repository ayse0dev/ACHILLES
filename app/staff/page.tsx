import DashboardView from "@/components/DashboardView";

export const dynamic = "force-dynamic";

export default async function StaffPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
    const { tab } = await searchParams;
    return <DashboardView mode="staff" tab={tab} />;
}

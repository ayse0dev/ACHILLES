import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { api, colors, peso } from "../lib/api";

type Order = { reference: string; items: string; total: number; status: string; createdAt: string; address: string; payment: string };

const statusColor: Record<string, string> = {
    "Pending payment": colors.orange,
    Paid: colors.teal,
    Confirmed: colors.teal,
    Packed: colors.purple,
    Shipped: colors.purple,
    Delivered: "#2e9d57",
    Cancelled: "#c0243c",
};

export default function Orders() {
    const [orders, setOrders] = useState<Order[] | null>(null);
    const [error, setError] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        try {
            setOrders((await api<{ orders: Order[] }>("/api/mobile/orders")).orders);
            setError("");
        } catch (e: any) {
            setError(e.message);
            setOrders([]);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    if (orders === null) return <ActivityIndicator color={colors.ink} style={{ marginTop: 40 }} />;

    return (
        <FlatList
            data={orders}
            keyExtractor={(o) => o.reference}
            contentContainerStyle={{ padding: 16, gap: 12 }}
            refreshing={refreshing}
            onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }}
            ListEmptyComponent={<Text style={{ color: colors.muted, textAlign: "center", marginTop: 30 }}>{error || "No orders yet."}</Text>}
            renderItem={({ item }) => (
                <View style={{ borderWidth: 2, borderColor: colors.ink, padding: 14, gap: 4 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={{ fontWeight: "900", color: colors.ink }}>{item.reference}</Text>
                        <Text style={{ fontWeight: "800", color: statusColor[item.status] ?? colors.ink }}>{item.status}</Text>
                    </View>
                    <Text style={{ color: colors.muted }}>{item.items}</Text>
                    <Text style={{ fontWeight: "900", fontSize: 16 }}>{peso(item.total)}</Text>
                    {item.createdAt ? <Text style={{ color: colors.muted, fontSize: 12 }}>{new Date(item.createdAt).toLocaleString("en-PH")}</Text> : null}
                </View>
            )}
        />
    );
}

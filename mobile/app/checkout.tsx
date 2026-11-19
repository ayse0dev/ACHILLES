import { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { api, colors, peso } from "../lib/api";
import { useStore } from "../lib/store";
import { Button, Title, s } from "../components/ui";

type Saved = { id: string; label: string; line: string; home: boolean };
const payments = [
    { key: "online", label: "GCash, Maya or card", note: "Pay securely online" },
    { key: "banking", label: "Online banking", note: "Pay through your bank" },
    { key: "cod", label: "Cash on delivery", note: "Pay when it arrives. We will call to confirm." },
] as const;

function Radio({ on, title, note, onPress }: { on: boolean; title: string; note?: string; onPress: () => void }) {
    return (
        <Pressable onPress={onPress} style={{ borderWidth: 2, borderColor: on ? colors.ink : colors.line, padding: 12, marginBottom: 8, backgroundColor: on ? "#f6f3fa" : "#fff" }}>
            <Text style={{ fontWeight: "800", color: colors.ink }}>{title}</Text>
            {note ? <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>{note}</Text> : null}
        </Pressable>
    );
}

export default function Checkout() {
    const router = useRouter();
    const { cart, total, clear } = useStore();
    const [saved, setSaved] = useState<Saved[]>([]);
    const [addressId, setAddressId] = useState("");
    const [phone, setPhone] = useState("");
    const [useNew, setUseNew] = useState(false);
    const [f, setF] = useState({ region: "", municipality: "", barangay: "", street: "" });
    const [payment, setPayment] = useState<"online" | "banking" | "cod">("online");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        api<{ phone: string; addresses: Saved[] }>("/api/mobile/me")
            .then((m) => {
                setPhone(m.phone);
                setSaved(m.addresses);
                if (m.addresses[0]) setAddressId(m.addresses[0].id);
                else setUseNew(true);
            })
            .catch(() => setUseNew(true));
    }, []);

    async function place() {
        setError("");
        setBusy(true);
        try {
            const res = await api<{ url?: string; redirect?: string }>("/api/checkout", {
                items: cart.map((c) => ({ slug: c.slug, size: c.size, qty: c.qty })),
                phone,
                payment,
                discount: "none",
                ...(useNew ? { newAddress: { label: "", ...f, lat: null, lng: null }, saveAddress: true } : { addressId }),
            });
            clear();
            if (res.url) {
                await WebBrowser.openBrowserAsync(res.url);
                Alert.alert("Payment", "Your order is confirmed once the payment goes through. You can follow it in My orders.");
            } else {
                Alert.alert("Order placed", "We will keep you posted by email and notifications.");
            }
            router.replace("/orders");
        } catch (e: any) {
            setError(e.message);
        }
        setBusy(false);
    }

    const set = (k: keyof typeof f) => (v: string) => setF((p) => ({ ...p, [k]: v }));

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 50 }} keyboardShouldPersistTaps="handled">
                <Title sub="Almost there">Checkout</Title>

                <Text style={s.label}>Contact number</Text>
                <TextInput style={s.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+63 9xx xxx xxxx" />

                <Text style={s.label}>Deliver to</Text>
                {saved.map((a) => (
                    <Radio key={a.id} on={!useNew && addressId === a.id} title={a.label || "Saved address"} note={a.line} onPress={() => { setUseNew(false); setAddressId(a.id); }} />
                ))}
                <Radio on={useNew} title="Use a new address" onPress={() => setUseNew(true)} />
                {useNew && (
                    <View style={{ gap: 8 }}>
                        <TextInput style={s.input} placeholder="Street, house no." value={f.street} onChangeText={set("street")} />
                        <TextInput style={s.input} placeholder="Barangay" value={f.barangay} onChangeText={set("barangay")} />
                        <TextInput style={s.input} placeholder="City / Municipality" value={f.municipality} onChangeText={set("municipality")} />
                        <TextInput style={s.input} placeholder="Region (e.g. Metro Manila)" value={f.region} onChangeText={set("region")} />
                    </View>
                )}

                <Text style={s.label}>Payment</Text>
                {payments.map((p) => (
                    <Radio key={p.key} on={payment === p.key} title={p.label} note={p.note} onPress={() => setPayment(p.key)} />
                ))}

                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 18 }}>
                    <Text style={{ fontWeight: "800", textTransform: "uppercase" }}>Total</Text>
                    <Text style={{ fontWeight: "900", fontSize: 20 }}>{peso(total)}</Text>
                </View>
                {error ? <Text style={s.error}>{error}</Text> : null}
                <View style={{ marginTop: 16 }}>
                    <Button title={payment === "cod" ? "Place order" : "Pay now"} onPress={place} loading={busy} disabled={!phone || cart.length === 0 || (useNew ? !(f.street && f.barangay && f.municipality && f.region) : !addressId)} />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

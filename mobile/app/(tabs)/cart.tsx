import { FlatList, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { colors, peso } from "../../lib/api";
import { useStore } from "../../lib/store";
import { Button, Photo } from "../../components/ui";

export default function Cart() {
    const router = useRouter();
    const { cart, setQty, total, user } = useStore();

    if (!user) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 14 }}>
                <Text style={{ fontWeight: "800", fontSize: 18 }}>Log in to see your cart</Text>
                <Button title="Log in" onPress={() => router.push("/login")} />
            </View>
        );
    }
    if (cart.length === 0) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 14 }}>
                <Text style={{ fontWeight: "800", fontSize: 18 }}>Your cart is empty</Text>
                <Button title="Shop shoes" onPress={() => router.push("/shop")} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <FlatList
                data={cart}
                keyExtractor={(c) => `${c.slug}-${c.size}`}
                contentContainerStyle={{ padding: 16 }}
                ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.line, marginVertical: 12 }} />}
                renderItem={({ item }) => (
                    <View style={{ flexDirection: "row", gap: 12 }}>
                        <Photo src={item.image} name={item.name} width={256} style={{ width: 80, height: 80 }} />
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontWeight: "800", color: colors.ink }}>{item.name}</Text>
                            <Text style={{ color: colors.muted }}>Size {item.size}</Text>
                            <Text style={{ fontWeight: "800", marginTop: 2 }}>{peso(item.price * item.qty)}</Text>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginTop: 6 }}>
                                <Pressable onPress={() => setQty(item.slug, item.size, item.qty - 1)} style={{ borderWidth: 2, borderColor: colors.ink, width: 32, height: 32, alignItems: "center", justifyContent: "center" }}>
                                    <Text style={{ fontWeight: "900" }}>−</Text>
                                </Pressable>
                                <Text style={{ fontWeight: "800" }}>{item.qty}</Text>
                                <Pressable onPress={() => setQty(item.slug, item.size, item.qty + 1)} style={{ borderWidth: 2, borderColor: colors.ink, width: 32, height: 32, alignItems: "center", justifyContent: "center" }}>
                                    <Text style={{ fontWeight: "900" }}>+</Text>
                                </Pressable>
                                <Pressable onPress={() => setQty(item.slug, item.size, 0)}>
                                    <Text style={{ color: "#c0243c", fontWeight: "700", marginLeft: 8 }}>Remove</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                )}
            />
            <View style={{ padding: 16, borderTopWidth: 1, borderColor: colors.line, gap: 12 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontWeight: "800", textTransform: "uppercase" }}>Subtotal</Text>
                    <Text style={{ fontWeight: "900", fontSize: 18 }}>{peso(total)}</Text>
                </View>
                <Button title="Checkout" onPress={() => router.push("/checkout")} />
            </View>
        </View>
    );
}

import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, peso, priceOf, type Product } from "../../lib/api";
import { useStore } from "../../lib/store";
import { Button, Photo } from "../../components/ui";

export default function ProductScreen() {
    const { data } = useLocalSearchParams<{ data: string }>();
    const router = useRouter();
    const { add, user } = useStore();
    const p: Product = JSON.parse(data);
    const [size, setSize] = useState("");
    const [photo, setPhoto] = useState(0);
    const [added, setAdded] = useState(false);
    const price = priceOf(p);
    const out = p.stock <= 0;

    function addToCart() {
        if (!user) return router.push("/login");
        if (!size) return;
        add({ slug: p.slug, name: p.name, price, image: p.images[0], size, qty: 1, stock: p.stock });
        setAdded(true);
    }

    return (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            <Photo src={p.images[photo]} name={p.name} width={828} style={{ width: "100%", aspectRatio: 1 }} />
            {p.images.length > 1 && (
                <ScrollView horizontal contentContainerStyle={{ padding: 12, gap: 8 }}>
                    {p.images.map((img, i) => (
                        <Pressable key={img} onPress={() => setPhoto(i)} style={{ borderWidth: 2, borderColor: i === photo ? colors.ink : "transparent" }}>
                            <Photo src={img} name={p.name} style={{ width: 64, height: 64 }} />
                        </Pressable>
                    ))}
                </ScrollView>
            )}
            <View style={{ padding: 16 }}>
                {p.category ? <Text style={{ fontSize: 11, fontWeight: "800", letterSpacing: 2, textTransform: "uppercase", color: colors.purple }}>{p.category}</Text> : null}
                <Text style={{ fontSize: 26, fontWeight: "900", color: colors.ink, marginTop: 2 }}>{p.name}</Text>
                <Text style={{ fontSize: 22, fontWeight: "900", marginTop: 6 }}>
                    {peso(price)} {price < p.price ? <Text style={{ fontSize: 15, fontWeight: "400", color: colors.muted, textDecorationLine: "line-through" }}>{peso(p.price)}</Text> : null}
                </Text>
                {p.description ? <Text style={{ color: colors.muted, marginTop: 10, lineHeight: 21 }}>{p.description}</Text> : null}

                <Text style={{ fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1, color: colors.muted, marginTop: 20, marginBottom: 8 }}>Select size</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {p.sizes.map((sz) => (
                        <Pressable
                            key={sz}
                            onPress={() => { setSize(sz); setAdded(false); }}
                            style={{ minWidth: 48, paddingVertical: 10, alignItems: "center", borderWidth: 2, borderColor: colors.ink, backgroundColor: sz === size ? colors.ink : "#fff" }}
                        >
                            <Text style={{ fontWeight: "800", color: sz === size ? "#fff" : colors.ink }}>{sz}</Text>
                        </Pressable>
                    ))}
                </View>

                <View style={{ marginTop: 22, gap: 10 }}>
                    {out ? (
                        <Text style={{ fontWeight: "800", color: "#c0243c" }}>Out of stock</Text>
                    ) : added ? (
                        <>
                            <Text style={{ fontWeight: "800", color: colors.teal }}>Added to your cart</Text>
                            <Button title="View cart" onPress={() => router.push("/cart")} />
                        </>
                    ) : (
                        <Button title={!user ? "Log in to add to cart" : size ? "Add to cart" : "Choose a size"} onPress={addToCart} disabled={!!user && !size} />
                    )}
                </View>
            </View>
        </ScrollView>
    );
}

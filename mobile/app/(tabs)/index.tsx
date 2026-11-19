import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { api, cachedGet, colors, type Product } from "../../lib/api";
import { ProductCard, Title } from "../../components/ui";

const cats = [
    { label: "Men", color: colors.teal },
    { label: "Women", color: colors.purple },
    { label: "Kids", color: colors.orange },
    { label: "Sports", color: "#e8374f" },
    { label: "Cleaning", color: colors.ink },
];

export default function Home() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[] | null>(cachedGet<{ products: Product[] }>("/api/products?limit=8")?.products ?? null);

    useEffect(() => {
        api<{ products: Product[] }>("/api/products?limit=8").then((d) => setProducts(d.products)).catch(() => setProducts([]));
    }, []);

    return (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
            <View style={{ backgroundColor: colors.ink, padding: 24, marginBottom: 20 }}>
                <Text style={{ color: colors.yellow, fontWeight: "800", letterSpacing: 2, fontSize: 11, textTransform: "uppercase" }}>Footwear &amp; repair</Text>
                <Text style={{ color: "#fff", fontSize: 34, fontWeight: "900", textTransform: "uppercase", marginTop: 6, lineHeight: 36 }}>
                    Repair.{"\n"}Restore.{"\n"}Retail.
                </Text>
                <Text style={{ color: "#ffffffcc", marginTop: 10 }}>Quality shoe repair and footwear for the whole family.</Text>
                <View style={{ flexDirection: "row", gap: 10, marginTop: 18 }}>
                    <Pressable onPress={() => router.push("/shop")} style={{ backgroundColor: "#fff", paddingVertical: 12, paddingHorizontal: 18 }}>
                        <Text style={{ fontWeight: "800", textTransform: "uppercase", color: colors.ink, fontSize: 12 }}>Shop shoes</Text>
                    </Pressable>
                    <Pressable onPress={() => router.push("/repairs")} style={{ borderColor: "#fff", borderWidth: 2, paddingVertical: 10, paddingHorizontal: 18 }}>
                        <Text style={{ fontWeight: "800", textTransform: "uppercase", color: "#fff", fontSize: 12 }}>Repairs</Text>
                    </Pressable>
                </View>
            </View>

            <Title sub="Browse">Shop by category</Title>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                {cats.map((c) => (
                    <Pressable
                        key={c.label}
                        onPress={() => router.push({ pathname: "/shop", params: { category: c.label } })}
                        style={{ backgroundColor: c.color, width: "31.5%", aspectRatio: 1, justifyContent: "flex-end", padding: 10 }}
                    >
                        <Text style={{ color: "#fff", fontWeight: "900", textTransform: "uppercase" }}>{c.label}</Text>
                    </Pressable>
                ))}
            </View>

            <Title sub="Fresh picks">Featured shoes</Title>
            {products === null ? (
                <ActivityIndicator color={colors.ink} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={products}
                    keyExtractor={(p) => p.id}
                    numColumns={2}
                    scrollEnabled={false}
                    renderItem={({ item }) => <ProductCard p={item} />}
                    ListEmptyComponent={<Text style={{ color: colors.muted }}>New shoes are on the way.</Text>}
                />
            )}
        </ScrollView>
    );
}

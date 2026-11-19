import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { api, colors, type Product } from "../../lib/api";
import { ProductCard } from "../../components/ui";

const cats = ["All", "Men", "Women", "Kids", "Sports", "Cleaning"];

export default function Shop() {
    const params = useLocalSearchParams<{ category?: string }>();
    const [cat, setCat] = useState(params.category ?? "All");
    const [products, setProducts] = useState<Product[]>([]);
    const [next, setNext] = useState<string | undefined>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.category) setCat(params.category);
    }, [params.category]);

    const load = useCallback(
        async (offset?: string) => {
            setLoading(true);
            try {
                const q = `/api/products?limit=20${cat !== "All" ? `&category=${cat}` : ""}${offset ? `&offset=${offset}` : ""}`;
                const d = await api<{ products: Product[]; nextOffset?: string }>(q);
                setProducts((prev) => (offset ? [...prev, ...d.products] : d.products));
                setNext(d.nextOffset);
            } catch {
                if (!offset) setProducts([]);
            }
            setLoading(false);
        },
        [cat]
    );

    useEffect(() => {
        setProducts([]);
        load();
    }, [load]);

    return (
        <View style={{ flex: 1 }}>
            <View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 12, gap: 8 }}>
                    {cats.map((c) => (
                        <Pressable
                            key={c}
                            onPress={() => setCat(c)}
                            style={{ paddingHorizontal: 16, paddingVertical: 9, borderWidth: 2, borderColor: colors.ink, backgroundColor: c === cat ? colors.ink : "#fff" }}
                        >
                            <Text style={{ fontWeight: "800", color: c === cat ? "#fff" : colors.ink, textTransform: "uppercase", fontSize: 12 }}>{c}</Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>
            <FlatList
                data={products}
                keyExtractor={(p) => p.id}
                numColumns={2}
                contentContainerStyle={{ padding: 10, paddingBottom: 30 }}
                renderItem={({ item }) => <ProductCard p={item} />}
                onEndReached={() => next && !loading && load(next)}
                onEndReachedThreshold={0.4}
                ListFooterComponent={loading ? <ActivityIndicator color={colors.ink} style={{ margin: 20 }} /> : undefined}
                ListEmptyComponent={loading ? undefined : <Text style={{ textAlign: "center", color: colors.muted, marginTop: 30 }}>No shoes found.</Text>}
            />
        </View>
    );
}

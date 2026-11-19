import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { colors, imageUrl, peso, priceOf, type Product } from "../lib/api";

export function Button({
    title,
    onPress,
    kind = "ink",
    disabled,
    loading,
}: {
    title: string;
    onPress: () => void;
    kind?: "ink" | "ghost" | "accent";
    disabled?: boolean;
    loading?: boolean;
}) {
    const bg = kind === "ink" ? colors.ink : kind === "accent" ? colors.orange : "transparent";
    const fg = kind === "ghost" ? colors.ink : "#fff";
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled || loading}
            style={({ pressed }) => [s.btn, { backgroundColor: bg, borderColor: colors.ink, opacity: disabled ? 0.4 : pressed ? 0.8 : 1 }]}
        >
            {loading ? <ActivityIndicator color={fg} /> : <Text style={[s.btnText, { color: fg }]}>{title}</Text>}
        </Pressable>
    );
}

export function Photo({ src, name, style }: { src?: string; name: string; style?: any }) {
    const url = imageUrl(src);
    if (url) return <Image source={{ uri: url }} style={[{ backgroundColor: "#f3f1ee" }, style]} resizeMode="contain" />;
    return (
        <View style={[{ backgroundColor: "#f3f1ee", alignItems: "center", justifyContent: "center" }, style]}>
            <Text style={{ fontSize: 40, fontWeight: "900", color: colors.purple }}>{name.slice(0, 1)}</Text>
        </View>
    );
}

export function ProductCard({ p }: { p: Product }) {
    const router = useRouter();
    const price = priceOf(p);
    return (
        <Pressable
            style={s.card}
            onPress={() => router.push({ pathname: "/product/[slug]", params: { slug: p.slug, data: JSON.stringify(p) } })}
        >
            <Photo src={p.images[0]} name={p.name} style={{ width: "100%", aspectRatio: 1 }} />
            {p.badge ? <Text style={s.badge}>{p.badge}</Text> : null}
            <Text style={s.cardName} numberOfLines={2}>
                {p.name}
            </Text>
            <Text style={s.cardPrice}>
                {peso(price)} {price < p.price ? <Text style={s.strike}>{peso(p.price)}</Text> : null}
            </Text>
        </Pressable>
    );
}

export function Title({ children, sub }: { children: string; sub?: string }) {
    return (
        <View style={{ marginBottom: 14 }}>
            {sub ? <Text style={s.eyebrow}>{sub}</Text> : null}
            <Text style={s.title}>{children}</Text>
        </View>
    );
}

export const s = StyleSheet.create({
    btn: { paddingVertical: 14, paddingHorizontal: 22, alignItems: "center", justifyContent: "center", borderWidth: 2, minHeight: 50 },
    btnText: { fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.6, fontSize: 13 },
    card: { flex: 1, margin: 6 },
    cardName: { fontWeight: "700", marginTop: 8, color: colors.ink, fontSize: 13 },
    cardPrice: { marginTop: 2, fontWeight: "800", color: colors.ink },
    strike: { fontWeight: "400", color: colors.muted, textDecorationLine: "line-through", fontSize: 12 },
    badge: { position: "absolute", top: 0, left: 0, backgroundColor: colors.ink, color: "#fff", fontSize: 10, fontWeight: "800", textTransform: "uppercase", paddingHorizontal: 8, paddingVertical: 4 },
    eyebrow: { fontSize: 11, fontWeight: "800", letterSpacing: 2, textTransform: "uppercase", color: colors.purple },
    title: { fontSize: 28, fontWeight: "900", textTransform: "uppercase", color: colors.ink },
    input: { borderWidth: 2, borderColor: colors.ink, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: colors.ink, backgroundColor: "#fff" },
    label: { fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1, color: colors.muted, marginBottom: 6, marginTop: 14 },
    error: { color: "#c0243c", fontWeight: "700", marginTop: 10 },
});

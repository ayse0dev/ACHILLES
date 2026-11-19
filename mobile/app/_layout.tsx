import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { StoreProvider, useStore } from "../lib/store";
import { colors } from "../lib/api";

function Shell() {
    const { ready } = useStore();
    if (!ready) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" }}>
                <ActivityIndicator color={colors.ink} />
            </View>
        );
    }
    return (
        <Stack screenOptions={{ headerTintColor: colors.ink, headerTitleStyle: { fontWeight: "800" }, contentStyle: { backgroundColor: "#fff" } }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="product/[slug]" options={{ title: "" }} />
            <Stack.Screen name="login" options={{ title: "Log in", presentation: "modal" }} />
            <Stack.Screen name="checkout" options={{ title: "Checkout" }} />
            <Stack.Screen name="orders" options={{ title: "My orders" }} />
        </Stack>
    );
}

export default function RootLayout() {
    return (
        <StoreProvider>
            <StatusBar style="dark" />
            <Shell />
        </StoreProvider>
    );
}

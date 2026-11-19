import { Tabs } from "expo-router";
import { Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../lib/api";
import { useStore } from "../../lib/store";

export default function TabsLayout() {
    const { count, user } = useStore();
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: colors.ink,
                tabBarInactiveTintColor: "#9a96ad",
                tabBarLabelStyle: { fontWeight: "700", fontSize: 11 },
                headerTitle: () => <Image source={require("../../assets/logo.png")} style={{ height: 34, width: 130 }} resizeMode="contain" />,
                headerStyle: { backgroundColor: "#fff" },
            }}
        >
            <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color as string} size={size} /> }} />
            <Tabs.Screen name="shop" options={{ title: "Shop", tabBarIcon: ({ color, size }) => <Ionicons name="bag-handle-outline" color={color as string} size={size} /> }} />
            <Tabs.Screen name="repairs" options={{ title: "Repairs", tabBarIcon: ({ color, size }) => <Ionicons name="construct-outline" color={color as string} size={size} /> }} />
            <Tabs.Screen
                name="cart"
                options={{
                    title: "Cart",
                    href: user ? undefined : null,
                    tabBarBadge: count > 0 ? count : undefined,
                    tabBarIcon: ({ color, size }) => <Ionicons name="cart-outline" color={color as string} size={size} />,
                }}
            />
            <Tabs.Screen name="account" options={{ title: "Account", tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color as string} size={size} /> }} />
        </Tabs>
    );
}

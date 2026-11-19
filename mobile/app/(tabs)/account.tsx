import { Alert, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { API_URL, colors } from "../../lib/api";
import { useStore } from "../../lib/store";
import { Button, Title } from "../../components/ui";

export default function Account() {
    const router = useRouter();
    const { user, signOut } = useStore();
    const open = (path: string) => WebBrowser.openBrowserAsync(`${API_URL}${path}`);

    if (!user) {
        return (
            <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
                <Title sub="Welcome">Your account</Title>
                <Text style={{ color: colors.muted, marginBottom: 8 }}>Log in to check out, save your cart and follow your orders.</Text>
                <Button title="Log in" onPress={() => router.push("/login")} />
                <Button title="Create an account" kind="ghost" onPress={() => open("/register")} />
                <Button title="Track an order" kind="ghost" onPress={() => open("/track")} />
            </ScrollView>
        );
    }

    return (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
            <Title sub={user.email}>{user.name}</Title>
            <Button title="My orders" onPress={() => router.push("/orders")} />
            <Button title="Manage profile and addresses" kind="ghost" onPress={() => open("/profile")} />
            <Button title="Support" kind="ghost" onPress={() => open("/support")} />
            <View style={{ height: 12 }} />
            <Button
                title="Log out"
                kind="ghost"
                onPress={() =>
                    Alert.alert("Log out?", "You can log back in any time.", [
                        { text: "Cancel", style: "cancel" },
                        { text: "Log out", style: "destructive", onPress: () => signOut() },
                    ])
                }
            />
        </ScrollView>
    );
}

import { ScrollView, Text, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { API_URL, colors } from "../../lib/api";
import { Button, Title } from "../../components/ui";

const steps = [
    ["1", "Request a repair", "Tell us what's wrong and add photos."],
    ["2", "Get a quote", "We reply within 24 hours with a price."],
    ["3", "Drop off or book a pickup", "Choose a time that suits you."],
    ["4", "Track and pay", "Follow progress, then pay online when it's done."],
];

export default function Repairs() {
    const open = (path: string) => WebBrowser.openBrowserAsync(`${API_URL}${path}`);
    return (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
            <Title sub="Soles, heels, stitching and more">Shoe repairs</Title>
            <View style={{ gap: 14, marginBottom: 24 }}>
                {steps.map(([n, t, d]) => (
                    <View key={n} style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
                        <View style={{ width: 40, height: 40, backgroundColor: colors.ink, alignItems: "center", justifyContent: "center" }}>
                            <Text style={{ color: "#fff", fontWeight: "900" }}>{n}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontWeight: "800", color: colors.ink }}>{t}</Text>
                            <Text style={{ color: colors.muted }}>{d}</Text>
                        </View>
                    </View>
                ))}
            </View>
            <View style={{ gap: 10 }}>
                <Button title="Request a repair" onPress={() => open("/repair")} />
                <Button title="Book a drop-off" kind="ghost" onPress={() => open("/book")} />
                <Button title="Track a repair or order" kind="ghost" onPress={() => open("/track")} />
            </View>
        </ScrollView>
    );
}

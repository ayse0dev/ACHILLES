import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { API_URL, api } from "../lib/api";
import { useStore, type User } from "../lib/store";
import { Button, Title, s } from "../components/ui";

export default function Login() {
    const router = useRouter();
    const { signIn } = useStore();
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [sentTo, setSentTo] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    async function submit() {
        setError("");
        setBusy(true);
        try {
            const res = await api<{ codeSent?: boolean; sentTo?: string; token?: string; user?: User }>("/api/mobile/login", {
                identifier,
                password,
                ...(sentTo ? { otp } : {}),
            });
            if (res.token && res.user) {
                await signIn(res.token, res.user);
                router.back();
            } else if (res.codeSent) {
                setSentTo(res.sentTo ?? "your email");
            }
        } catch (e: any) {
            setError(e.message);
        }
        setBusy(false);
    }

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
                <Title sub="Welcome back">Log in</Title>
                {!sentTo ? (
                    <>
                        <Text style={s.label}>Email or username</Text>
                        <TextInput style={s.input} value={identifier} onChangeText={setIdentifier} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" />
                        <Text style={s.label}>Password</Text>
                        <TextInput style={s.input} value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" />
                    </>
                ) : (
                    <>
                        <Text style={{ marginBottom: 6 }}>We sent a 6-digit code to {sentTo}.</Text>
                        <Text style={s.label}>Login code</Text>
                        <TextInput style={s.input} value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6} autoFocus />
                    </>
                )}
                {error ? <Text style={s.error}>{error}</Text> : null}
                <View style={{ marginTop: 20, gap: 10 }}>
                    <Button title={sentTo ? "Verify and log in" : "Send me a code"} onPress={submit} loading={busy} disabled={!identifier || !password || (!!sentTo && otp.length < 6)} />
                    {sentTo ? <Button title="Start over" kind="ghost" onPress={() => { setSentTo(""); setOtp(""); }} /> : null}
                    <Button title="Create an account" kind="ghost" onPress={() => WebBrowser.openBrowserAsync(`${API_URL}/register`)} />
                    <Button title="Forgot password" kind="ghost" onPress={() => WebBrowser.openBrowserAsync(`${API_URL}/forgot`)} />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

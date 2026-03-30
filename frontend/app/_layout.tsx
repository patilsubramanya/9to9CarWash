import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";

export default function RootLayout() {
  console.log("New code running");
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await SecureStore.getItemAsync("token");

        if (!token) {
          setLoading(false);
          return;
        }

        const decoded: any = jwtDecode(token);

        if (!decoded?.role) {
          await SecureStore.deleteItemAsync("token");
          setLoading(false);
          return;
        }

        setTimeout(() => {
          if (decoded.role === "customer") {
            router.replace("/(tabs)/home");
          } else if (decoded.role === "admin") {
            router.replace("/(tabs)/adminhome");
          } else if (decoded.role === "washer") {
            router.replace("/(tabs)/washerhome");
          } else if (decoded.role === "supervisor") {
            router.replace("/(tabs)/supervisorhome");
          }
        }, 100);
      } catch (err) {
        await SecureStore.deleteItemAsync("token");
      }

      setLoading(false);
    };

    checkToken();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#ffffff" },
          headerTintColor: "#111827",
          headerTitleStyle: { fontWeight: "600" },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />

        <Stack.Screen name="user-details" options={{ title: "User Details", presentation: "card" }} />
        <Stack.Screen name="admin-car-calendar" options={{ title: "Car Calendar", presentation: "card" }} />
        <Stack.Screen name="add-car" options={{ title: "Add Car", presentation: "card" }} />
        <Stack.Screen name="choose-service" options={{ title: "Choose Service", presentation: "card" }} />
        <Stack.Screen name="otp" options={{ title: "OTP Verification", presentation: "card" }} />
        <Stack.Screen name="register" options={{ title: "Register", presentation: "card" }} />
        <Stack.Screen name="forgot-password" options={{ title: "Forgot Password", presentation: "card" }} />
        <Stack.Screen name="reset-password" options={{ title: "Reset Password", presentation: "card" }} />
        <Stack.Screen name="thankyou" options={{ title: "Thank You", presentation: "card" }} />
        <Stack.Screen name="view-subscription" options={{ title: "My Subscriptions", presentation: "card" }} />
      </Stack>
    </SafeAreaProvider>
  );
}
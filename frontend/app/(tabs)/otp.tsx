import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function OTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [otp, setOtp] = useState("");

  const API = "http://192.168.31.140:5000";

  // Fade animation
  const fadeAnim = new Animated.Value(0);
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  const handleVerifyOtp = async () => {
    try {
      await axios.post(`${API}/auth/verify-otp`, {
        phone: params.phone,
        otp,
      });

      await axios.post(`${API}/auth/register`, {
        name: params.name,
        address: params.address,
        google_location: params.googleLocation,
        email: params.email,
        phone: params.phone,
        password: params.password,
      });

      alert("Registration Successful!");
      router.replace("/");
    } catch (err: any) {
      alert(err.response?.data?.error || "Incorrect OTP");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
        <Image
          source={require("../../assets/images/logo.jpeg")}
          style={styles.logo}
        />

        <Text style={styles.title}>OTP Verification</Text>

        <Text style={styles.subtitle}>
          Enter the OTP sent to{" "}
          <Text style={{ fontWeight: "bold" }}>{params.phone}</Text>
        </Text>

        <TextInput
          label="Enter OTP"
          value={otp}
          onChangeText={setOtp}
          mode="outlined"
          style={styles.input}
          keyboardType="numeric"
          maxLength={6}
        />

        <Button mode="contained" onPress={handleVerifyOtp} style={styles.btn}>
          Verify OTP
        </Button>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#d3d3d3",
    justifyContent: "center",
    padding: 20,
  },

  card: {
    backgroundColor: "white",
    padding: 25,
    borderRadius: 16,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.13,
    shadowRadius: 9,
  },

  logo: {
    width: 120,
    height: 120,
    alignSelf: "center",
    marginBottom: 20,
    borderRadius: 60,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#333",
  },

  subtitle: {
    textAlign: "center",
    marginBottom: 20,
    color: "#555",
    fontSize: 14,
  },

  input: {
    marginBottom: 14,
  },

  btn: {
    marginTop: 10,
    backgroundColor: "#28a745",
    paddingVertical: 6,
    borderRadius: 10,
  },
});

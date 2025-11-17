import { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function OTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [otp, setOtp] = useState("");

  const API = "http://192.168.0.105:5000";

  const handleVerifyOtp = async () => {
    try {
      const res = await axios.post(`${API}/auth/verify-otp`, {
        phone: params.phone,
        otp: otp,
      });

      // If OTP verified → register user fully
      await axios.post(`${API}/auth/register`, {
        name: params.name,
        address: params.address,
        google_location: params.googleLocation,
        email: params.email,
        phone: params.phone,
        password: params.password,
      });

      Alert.alert("Success", "Registration Completed!");
      router.replace("/");

    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.error || "Incorrect OTP");
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>OTP Verification</Text>

      <TextInput
        label="Enter OTP"
        value={otp}
        onChangeText={setOtp}
        style={styles.input}
        autoComplete="off" 
        autoCorrect={false}
      />

      <Button mode="contained" onPress={handleVerifyOtp} style={styles.btn}>
        Verify OTP
      </Button>

      <Text style={styles.info}>
        OTP sent to: {params.phone}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    padding: 20,
  },
  input: {
    marginBottom: 12,
    backgroundColor: "#f2f2f2",
  },
  btn: {
    marginVertical: 10,
    backgroundColor: "#28a745",
  },
  title: {
    marginBottom: 15,
    textAlign: "center",
  },
  info: {
    textAlign: "center",
    marginTop: 10,
    color: "gray",
  },
});

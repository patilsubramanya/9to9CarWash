import { useState } from "react";
import { View, StyleSheet, Alert, Image } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import axios from "axios";
import { Link } from "expo-router";

export default function ForgotPassword() {
  const [emailOrPhone, setEmailOrPhone] = useState("");

  const API = "http://192.168.31.140:5000";

  const handleSendOTP = async () => {
    if (!emailOrPhone) {
      Alert.alert("Error", "Enter your Email or Phone");
      return;
    }

    try {
      await axios.post(`${API}/auth/forgot-password`, {
        email_or_phone: emailOrPhone,
      });

      Alert.alert(
        "Reset Token Sent",
        "The reset token is printed in backend logs. Use it on the next screen."
      );
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.error || "Failed to send token");
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.card}>
        <Image
          source={require("../../assets/images/logo.jpeg")}
          style={styles.logo}
        />

        <Text style={styles.title}>Forgot Password</Text>

        <TextInput
          label="Email or Phone"
          value={emailOrPhone}
          onChangeText={setEmailOrPhone}
          mode="outlined"
          style={styles.input}
        />

        <Button mode="contained" onPress={handleSendOTP} style={styles.btn}>
          Send Reset Token
        </Button>

        <Link href="/reset-password" style={styles.link}>
          Already have token? Reset Password
        </Link>
      </View>
    </View>
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
    padding: 22,
    borderRadius: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    alignItems: "center",
  },

  logo: {
    width: 120,
    height: 120,
    marginBottom: 10,
    borderRadius: 60,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },

  input: {
    width: "100%",
    marginBottom: 14,
  },

  btn: {
    width: "100%",
    marginTop: 10,
    backgroundColor: "#007bff",
    paddingVertical: 6,
    borderRadius: 10,
  },

  link: {
    marginTop: 15,
    textAlign: "center",
    color: "#007bff",
    fontSize: 15,
    fontWeight: "600",
  },
});

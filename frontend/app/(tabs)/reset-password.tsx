import { useState } from "react";
import { View, Alert, StyleSheet } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import axios from "axios";
import { useRouter } from "expo-router";

export default function ResetPassword() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleResetPassword = async () => {
    if (!token || !newPassword) {
      Alert.alert("Error", "Enter token and new password");
      return;
    }

    try {
      await axios.post("http://192.168.31.140:5000/auth/reset-password", {
        token,
        new_password: newPassword,
      });

      Alert.alert("Success", "Password reset successful!", [
        { text: "OK", onPress: () => router.replace("/") },
      ]);
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.response?.data?.error || "Failed to reset password"
      );
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.card}>
        <Text style={styles.title}>Reset Password</Text>

        <TextInput
          label="Reset Token"
          value={token}
          onChangeText={setToken}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="New Password"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
          mode="outlined"
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handleResetPassword}
          style={styles.btn}
        >
          Reset Password
        </Button>
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
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },

  input: {
    marginBottom: 14,
  },

  btn: {
    marginTop: 10,
    backgroundColor: "#007bff",
    paddingVertical: 6,
    borderRadius: 10,
  },
});

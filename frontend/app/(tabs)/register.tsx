import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Easing,
  ScrollView,
} from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import axios from "axios";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function RegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [googleLocation, setGoogleLocation] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const API = "http://192.168.31.140:5000";

  // Fade-In animation
  const fadeAnim = new Animated.Value(0);
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSendOTP = async () => {
    if (!phone) return alert("Please enter phone number");

    try {
      await axios.post(`${API}/auth/send-otp`, { phone });

      alert("OTP sent!");

      router.push({
        pathname: "/otp",
        params: {
          name,
          address,
          googleLocation,
          email,
          phone,
          password,
        },
      });
    } catch (err: any) {
      alert(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#d3d3d3" }}>
      <Animated.View style={[styles.page, { opacity: fadeAnim }]}>
        <View style={styles.card}>
          {/* Logo */}
          <Image
            source={require("../../assets/images/logo.jpeg")}
            style={styles.logo}
          />

          <Text style={styles.title}>Create an Account</Text>

          {/* Inputs */}
          <TextInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Address"
            value={address}
            onChangeText={setAddress}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Google Maps Link (Optional)"
            value={googleLocation}
            onChangeText={setGoogleLocation}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            style={styles.input}
          />

          <TextInput
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
          />

          {/* Password with Show/Hide */}
          <TextInput
            label="Password"
            value={password}
            secureTextEntry={!showPass}
            onChangeText={setPassword}
            mode="outlined"
            style={styles.input}
            right={
              <TextInput.Icon
                icon={() => (
                  <MaterialCommunityIcons
                    name={showPass ? "eye-off" : "eye"}
                    size={22}
                    color="#666"
                  />
                )}
                onPress={() => setShowPass(!showPass)}
              />
            }
          />

          <Button mode="contained" onPress={handleSendOTP} style={styles.btn}>
            Send OTP
          </Button>

          <Text style={styles.link} onPress={() => router.push("/")}>
            Already have an account? Login
          </Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: "#fff",
    padding: 22,
    borderRadius: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },

  logo: {
    width: 120,
    height: 120,
    alignSelf: "center",
    marginBottom: 10,
    borderRadius: 60,
  },

  title: {
    fontSize: 26,
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },

  input: {
    marginBottom: 14,
    backgroundColor: "#f2f2f2",
  },

  btn: {
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

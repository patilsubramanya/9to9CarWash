import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import axios from "axios";
import { Link, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function LoginScreen() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const router = useRouter();

  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogin = async () => {
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("role");
    try {
      console.log("Trying USER login...");

      const res = await axios.post(
        "http://192.168.31.81:5000/auth/login",
        {
          email_or_phone: emailOrPhone,
          password: password,
        }
      );

      console.log("USER login success:", res.data);
      const { token, user } = res.data;
      await SecureStore.setItemAsync("token", res.data.token);
      await SecureStore.setItemAsync("role", user.role);

      switch (user.role) {
        case "admin":
          router.replace("/(tabs)/adminhome");
          break;
        case "supervisor":
          router.replace("/(tabs)/supervisorhome");
          break;
        case "washer":
          router.replace("/(tabs)/washerhome");
          break;
        default:
          router.replace("/(tabs)/home");
      }

      // if (user.role === "admin") {
      //   router.replace({
      //     pathname: "/(tabs)/adminhome",
      //     params: { token: res.data.token },
      //   });
      // } 
      // else if (user.role === "supervisor") {
      //   router.replace({
      //     pathname: "/(tabs)/supervisorhome",
      //     params: { token: res.data.token },
      //   });
      // }
      // else if (user.role === "washer") {
      //   router.replace({
      //     pathname: "/(tabs)/washerhome",
      //     params: { token: res.data.token },
      //   });
      // }
      // else {
      //   router.replace({
      //     pathname: "/(tabs)/home",
      //     params: { token: res.data.token },
      //   });
      // }
    } catch (userErr: any) {
      console.log("User login failed, trying ADMIN login...");

      // try {
      //   const adminRes = await axios.post(
      //     "http://192.168.31.81:5000/admin/login",
      //     {
      //       username_or_email: emailOrPhone,
      //       password: password,
      //     }
      //   );

      //   console.log("ADMIN login success:", adminRes.data);
      //   // await SecureStore.deleteItemAsync("token");
      //   await SecureStore.setItemAsync("token", adminRes.data.token);

      //   router.push({
      //     pathname: "/(tabs)/adminhome",
      //     params: { token: adminRes.data.token },
      //   });
      // } catch (adminErr: any) {
      //   console.log("Both logins failed");

      //   setMessage("Invalid login credentials.");
      // }
    }
  };

  return (
    <View style={styles.page}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={styles.card}>
          {/* LOGO */}
          <Image
            source={require("../assets/images/logo.jpeg")}
            style={styles.logo}
          />

          <Text style={styles.appTitle}>Welcome to Nine to Nine</Text>

          {/* Email / Phone */}
          <TextInput
            label="Email or Phone"
            value={emailOrPhone}
            onChangeText={setEmailOrPhone}
            mode="outlined"
            style={styles.input}
          />

          {/* Password with SHOW/HIDE toggle */}
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={!showPass}
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
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.loginBtn}
          >
            Login
          </Button>

          <Text style={styles.link} onPress={() => router.push("/register")}>
            New user? Register
          </Text>

          <Text
            style={styles.forgot}
            onPress={() => router.push("/forgot-password")}
          >
            Forgot your password?
          </Text>

          {message ? <Text style={styles.error}>{message}</Text> : null}
        </View>
      </Animated.View>
    </View>
  );
}

// ------------------ STYLES ------------------
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
  logo: {
    width: 140,
    height: 140,
    alignSelf: "center",
    marginBottom: 15,
    borderRadius: 70,
  },
  appTitle: {
    fontSize: 26,
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    marginBottom: 14,
    backgroundColor: "#fff",
  },
  loginBtn: {
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
  forgot: {
    marginTop: 8,
    textAlign: "center",
    color: "#555",
    textDecorationLine: "underline",
  },
  error: {
    marginTop: 12,
    color: "red",
    textAlign: "center",
    fontSize: 14,
  },
});
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
    try {
      console.log("Trying USER login...");

      const userRes = await axios.post(
        "http://192.168.31.140:5000/auth/login",
        {
          email_or_phone: emailOrPhone,
          password: password,
        }
      );

      console.log("USER login success:", userRes.data);
      await SecureStore.setItemAsync("token", userRes.data.token);

      router.replace({
        pathname: "/(tabs)/home",
        params: { token: userRes.data.token },
      });
    } catch (userErr: any) {
      console.log("User login failed, trying ADMIN login...");

      try {
        const adminRes = await axios.post(
          "http://192.168.31.140:5000/admin/login",
          {
            username_or_email: emailOrPhone,
            password: password,
          }
        );

        console.log("ADMIN login success:", adminRes.data);
        // await SecureStore.deleteItemAsync("token");
        await SecureStore.setItemAsync("token", adminRes.data.token);

        router.push({
          pathname: "/(tabs)/adminhome",
          params: { token: adminRes.data.token },
        });
      } catch (adminErr: any) {
        console.log("Both logins failed");

        setMessage("Invalid login credentials.");
      }
    }
  };

  //   return (
  //     <View style={styles.page}>
  //       <View style={styles.card}>
  //         <Text style={styles.appTitle}>Welcome to Nine to Nine</Text>

  // <TextInput
  //   label="Email or Phone"
  //   value={emailOrPhone}
  //   onChangeText={setEmailOrPhone}
  //   mode="outlined"
  //   style={styles.input}
  // />

  //         <TextInput
  //           label="Password"
  //           secureTextEntry
  //           value={password}
  //           onChangeText={setPassword}
  //           mode="outlined"
  //           style={styles.input}
  //         />

  //         <Button mode="contained" onPress={handleLogin} style={styles.loginBtn}>
  //           Login
  //         </Button>

  //         <Text style={styles.link} onPress={() => router.push("/register")}>
  //           New user? Register
  //         </Text>

  //         <Text
  //           style={styles.forgot}
  //           onPress={() => router.push("/forgot-password")}
  //         >
  //           Forgot your password?
  //         </Text>

  //         {message ? <Text style={styles.error}>{message}</Text> : null}
  //       </View>
  //     </View>
  //   );
  // }

  // const styles = StyleSheet.create({
  //   page: {
  //     flex: 1,
  //     backgroundColor: "#d3d3d3", // full-page background
  //     justifyContent: "center",
  //     padding: 20,
  //   },

  //   card: {
  //     backgroundColor: "white",
  //     padding: 22,
  //     borderRadius: 16,
  //     elevation: 5,
  //     shadowColor: "#000",
  //     shadowOpacity: 0.1,
  //     shadowRadius: 8,
  //   },

  //   appTitle: {
  //     fontSize: 28,
  //     textAlign: "center",
  //     fontWeight: "bold",
  //     marginBottom: 25,
  //     color: "#333",
  //   },

  //   input: {
  //     marginBottom: 14,
  //   },

  //   loginBtn: {
  //     marginTop: 10,
  //     backgroundColor: "#007bff",
  //     paddingVertical: 6,
  //     borderRadius: 10,
  //   },

  //   link: {
  //     marginTop: 15,
  //     textAlign: "center",
  //     color: "#007bff",
  //     fontSize: 15,
  //     fontWeight: "600",
  //   },

  //   forgot: {
  //     marginTop: 8,
  //     textAlign: "center",
  //     color: "#555",
  //     textDecorationLine: "underline",
  //   },

  //   error: {
  //     marginTop: 12,
  //     color: "red",
  //     textAlign: "center",
  //     fontSize: 14,
  //   },
  // });

  // return (
  //   <Animated.View
  //     style={[styles.container, { opacity: fadeAnim }]}
  //   >
  //     {/* App Logo */}
  //     <Image
  //       source={require("../../assets/logo.png")}   // <-- CHANGE your logo here
  //       style={styles.logo}
  //       resizeMode="contain"
  //     />

  //     {/* Box */}
  //     <View style={styles.box}>
  //       <Text variant="headlineMedium" style={styles.title}>
  //         Welcome Back 👋
  //       </Text>

  //       {/* Email / Phone */}
  //       <TextInput
  //         label="Email or Phone"
  //         value={emailOrPhone}
  //         onChangeText={setEmailOrPhone}
  //         style={styles.input}
  //         mode="outlined"
  //         left={<TextInput.Icon icon="account" />}
  //       />

  //       {/* Password */}
  //       <TextInput
  //         label="Password"
  //         secureTextEntry={!showPassword}
  //         value={password}
  //         onChangeText={setPassword}
  //         style={styles.input}
  //         mode="outlined"
  //         left={<TextInput.Icon icon="lock" />}
  //         right={
  //           <TextInput.Icon
  //             icon={showPassword ? "eye-off" : "eye"}
  //             onPress={() => setShowPassword(!showPassword)}
  //           />
  //         }
  //       />

  //       {/* Login Button */}
  //       <Button
  //         mode="contained"
  //         onPress={handleLogin}
  //         style={styles.btn}
  //       >
  //         Login
  //       </Button>

  //       {/* Forgot + Register */}
  //       <View style={{ marginTop: 15 }}>
  //         <TouchableOpacity onPress={() => router.push("/forgot-password")}>
  //           <Text style={styles.forgot}>Forgot Password?</Text>
  //         </TouchableOpacity>

  //         <Link href="/register" style={styles.register}>
  //           New user? Create an account
  //         </Link>
  //       </View>

  //       {/* Message */}
  //       {message ? <Text style={styles.message}>{message}</Text> : null}
  //     </View>
  //   </Animated.View>
  // );
  // }

  // const styles = StyleSheet.create({
  // container: {
  //   flex: 1,
  //   backgroundColor: "#d3d3d3",
  //   justifyContent: "center",
  //   alignItems: "center",
  //   padding: 20,
  // },

  // logo: {
  //   width: 140,
  //   height: 140,
  //   marginBottom: 10,
  // },

  // box: {
  //   width: "100%",
  //   backgroundColor: "white",
  //   padding: 25,
  //   borderRadius: 16,
  //   elevation: 4,
  // },

  // title: {
  //   textAlign: "center",
  //   marginBottom: 20,
  //   fontWeight: "700",
  // },

  // input: {
  //   marginBottom: 12,
  //   backgroundColor: "#f7f7f7",
  // },

  // btn: {
  //   marginTop: 10,
  //   backgroundColor: "#007bff",
  //   paddingVertical: 5,
  // },

  // forgot: {
  //   color: "#007bff",
  //   textAlign: "center",
  // },

  // register: {
  //   marginTop: 8,
  //   textAlign: "center",
  //   color: "black",
  //   fontWeight: "600",
  // },

  // message: {
  //   marginTop: 15,
  //   textAlign: "center",
  //   color: "red",
  // },
  // });

  //   return (
  //     <View style={styles.container}>
  //       <Image
  //         source={require("../../assets/images/logo.jpeg")}
  //         style={styles.logo}
  //       />

  //       <TextInput
  //         label="Email or Phone"
  //         value={emailOrPhone}
  //         onChangeText={setEmailOrPhone}
  //         mode="outlined"
  //         style={styles.input}
  //       />

  //       <TextInput
  //         label="Password"
  //         value={password}
  //         secureTextEntry={!showPass}
  //         onChangeText={setPassword}
  //         right={
  //           <TextInput.Icon
  //             icon={() => (
  //               <MaterialCommunityIcons
  //                 name={showPass ? "eye-off" : "eye"}
  //                 size={22}
  //                 color="#666"
  //               />
  //             )}
  //             onPress={() => setShowPass(!showPass)}
  //           />
  //         }
  //         style={styles.input}
  //       />

  //       <Button mode="contained" style={styles.btn}>
  //         Login
  //       </Button>
  //       {message ? <Text style={styles.error}>{message}</Text> : null}
  //       <Link href="/register" style={styles.registerLink}>
  //         New user? Register
  //       </Link>
  //       <TouchableOpacity onPress={() => router.push("/forgot-password")}>
  //         <Text style={styles.forgot}>Forgot password?</Text>
  //       </TouchableOpacity>
  //     </View>
  //   );
  // }

  // const styles = StyleSheet.create({
  //   container: { padding: 20, backgroundColor: "#d3d3d3", flex: 1 },
  //   input: { marginBottom: 12, backgroundColor: "#fff" },
  //   logo: {
  //     width: 140,
  //     height: 140,
  //     alignSelf: "center",
  //     marginBottom: 40,
  //     borderRadius: 10,
  //   },
  //   btn: {
  //     backgroundColor: "#007bff",
  //     marginTop: 10,
  //   },
  //   forgot: {
  //     textAlign: "right",
  //     marginBottom: 10,
  //     color: "#007bff",
  //     fontWeight: "500",
  //   },
  //   registerLink: {
  //     marginTop: 20,
  //     textAlign: "center",
  //     color: "#007bff",
  //     fontWeight: "bold",
  //   },
  //   error: {
  //     marginTop: 10,
  //     textAlign: "center",
  //     color: "red",
  //   },
  // });

  return (
    <View style={styles.page}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={styles.card}>
          {/* LOGO */}
          <Image
            source={require("../../assets/images/logo.jpeg")}
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

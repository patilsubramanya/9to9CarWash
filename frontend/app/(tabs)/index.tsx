import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import axios from 'axios';
import { Link, useRouter } from 'expo-router';
import * as SecureStore from "expo-secure-store";

export default function LoginScreen() {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  // const handleLogin = async () => {
  //   try {
  //     console.log("Sending login data:", {
  //     email_or_phone: emailOrPhone,
  //     password: password
  //     });
  //     const res = await axios.post('http://192.168.0.105:5000/auth/login', {
  //       email_or_phone: emailOrPhone,
  //       password: password
  //     });
  //     console.log("Login Response:", res.data);

  //     setMessage('Login successful!');
  //     router.push({ pathname: '/(tabs)/home', params: { token: res.data.token } });
  //   } catch (err: any) {
  //     console.log("Error:", err.response?.data||err.message);
  //     setMessage(err.response?.data?.error || 'Login failed.');
  //   }
  // };


const handleLogin = async () => {
  await SecureStore.deleteItemAsync("token");
  try {
    console.log("Trying USER login...");
    
    const userRes = await axios.post("http://192.168.0.105:5000/auth/login", {
      email_or_phone: emailOrPhone,
      password: password,
    });

    console.log("USER login success:", userRes.data);
    await SecureStore.setItemAsync("token", userRes.data.token);

    router.replace({
      pathname: "/(tabs)/home",
      params: { token: userRes.data.token },
    });

  } catch (userErr: any) {

    console.log("User login failed, trying ADMIN login...");

    try {
      const adminRes = await axios.post("http://192.168.0.105:5000/admin/login", {
        username_or_email: emailOrPhone,
        password: password,
      });

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


  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={{ marginBottom: 20 }}>
        Welcome to Nine to Nine
      </Text>
      <TextInput
        label="Email or Phone"
        value={emailOrPhone}
        onChangeText={setEmailOrPhone}
        style={styles.input}
        autoComplete="off"
        autoCorrect={false}
      />
      <TextInput
        label="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        autoComplete="off" 
        autoCorrect={false}
      />
      <Button mode="contained" onPress={handleLogin} style={styles.btn}>
        Login
      </Button>

      <Link href="/register" style={styles.link}>
        New user? Register
      </Link>

      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',     
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#f2f2f2',   
  },
  btn: {
    marginVertical: 10,
    backgroundColor: '#007bff',   
  },
  link: {
    textAlign: 'center',
    color: '#007bff',             
    marginTop: 10,
  },
  message: {
    textAlign: 'center',
    marginTop: 10,
    color: 'black',               
  },
});

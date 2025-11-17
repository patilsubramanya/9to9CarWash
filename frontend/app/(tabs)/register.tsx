import { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import axios from 'axios';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [googleLocation, setGoogleLocation] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const API = "http://192.168.0.105:5000"; // your backend

  const handleSendOTP = async () => {
    if (!phone) {
      return Alert.alert("Error", "Please enter a phone number");
    }

    try {
      const res = await axios.post(`${API}/auth/send-otp`, { phone });
      Alert.alert("OTP Sent", "Please check your phone for the OTP.");
      
      router.push({
        pathname: "/otp",
        params: {
          name,
          address,
          googleLocation,
          email,
          phone,
          password
        }
      });

    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Register</Text>

      <TextInput label="Full Name" value={name} onChangeText={setName} style={styles.input} autoComplete="off" autoCorrect={false} />

      <TextInput label="Address" value={address} onChangeText={setAddress} style={styles.input} autoComplete="off" autoCorrect={false} />

      <TextInput
        label="Google Maps Location (Optional)"
        value={googleLocation}
        onChangeText={setGoogleLocation}
        style={styles.input}
        autoComplete="off" 
        autoCorrect={false}
      />

      <TextInput label="Email" value={email} onChangeText={setEmail} style={styles.input} autoComplete="off" autoCorrect={false} />

      <TextInput label="Phone Number" value={phone} onChangeText={setPhone} style={styles.input} autoComplete="off" autoCorrect={false} />

      <TextInput
        label="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        autoComplete="off" 
        autoCorrect={false}
      />

      <Button mode="contained" onPress={handleSendOTP} style={styles.btn}>
        Send OTP
      </Button>

      <Text style={styles.link} onPress={() => router.push("/")}>
        Already have an account? Login
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
    backgroundColor: "#007bff",
  },
  title: {
    marginBottom: 15,
    textAlign: "center",
  },
  link: {
    textAlign: "center",
    color: "#007bff",
    marginTop: 10,
  },
});

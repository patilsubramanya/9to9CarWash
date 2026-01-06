import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import axios from 'axios';
import { BASE_URL } from '../config/api';

export default function LoginScreen({ navigation }) {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    try {
      const res = await axios.post(`http://192.168.31.140/auth/login`, {
        email_or_phone: emailOrPhone,
        password: password
      });
      setMessage('Login Successful!');
      navigation.navigate('Home', { token: res.data.token });
    } catch (err) {
      setMessage(err.response?.data?.error || 'Login Failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">9to9 Car Wash</Text>
      <TextInput
        label="Email or Phone"
        value={emailOrPhone}
        onChangeText={setEmailOrPhone}
        style={styles.input}
      />
      <TextInput
        label="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        style={styles.input}
      />
      <Button mode="contained" onPress={handleLogin}>
        Login
      </Button>
      <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
        New user? Register
      </Text>
      <Text>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: { marginBottom: 10 },
  link: { marginTop: 20, color: 'blue', textAlign: 'center' },
});

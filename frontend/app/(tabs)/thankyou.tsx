import { View, Text, StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function ThankYou() {
  const router = useRouter();
  const params = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thank You!</Text>
      <Text style={styles.subtitle}>Our team will contact you shortly.</Text>
      
      <Button mode="contained" onPress={() => router.replace({pathname: "/home", params: {token: params.token}})} style={styles.btn}>
        Go to Home
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white" },
  title: { fontSize: 30, marginBottom: 10 },
  subtitle: { color: "gray", marginBottom: 20 },
  btn: { backgroundColor: "#007bff" }
});

import { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import { Text, Button } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function ThankYou() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.page}>
      <Animated.View
        style={[
          styles.card,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <MaterialCommunityIcons
          name="check-circle"
          size={90}
          color="#28a745"
          style={{ alignSelf: "center", marginBottom: 10 }}
        />

        <Text style={styles.title}>Thank You!</Text>
        <Text style={styles.subtitle}>
          Your details have been submitted. Our team will contact you shortly.
        </Text>

        <Button
          mode="contained"
          onPress={() =>
            router.replace({
              pathname: "/(tabs)/home",
              params: { token: params.token },
            })
          }
          style={styles.btn}
        >
          Go to Home
        </Button>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "lightgrey",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "white",
    padding: 28,
    borderRadius: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
    marginBottom: 20,
  },
  btn: {
    backgroundColor: "#007bff",
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 10,
  },
});

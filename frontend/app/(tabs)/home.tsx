import { useEffect, useState, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { Text } from "react-native-paper";
import api from "../../api";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const normalize = (v: string | any[]) => (Array.isArray(v) ? v[0] : v);
  const navToken = normalize(params.token);

  // const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [cars, setCars] = useState<any[]>([]);
  const [isReady, setIsReady] = useState(false);

  const loadToken = async () => {
    let t = navToken;

    if (t) {
      await SecureStore.setItemAsync("token", t);
      // setToken(t);
      setIsReady(true);
      return;
    }

    t = await SecureStore.getItemAsync("token");

    if (t) {
      // setToken(t);
      setIsReady(true);
    } else {
      router.replace("/");
    }
  };

  useEffect(() => {
    loadToken();
  }, [navToken]);
  const fetchUser = async () => {
  try {
    const t = await SecureStore.getItemAsync("token");
    if (!t) {
      router.replace("/");
      return;
    }

    const res = await api.post(
      "/auth/me",
      {},
      {
        headers: {
          Authorization: `Bearer ${t}`,
        },
      }
    );

    setUser(res.data);
  } catch (error: any) {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync("token");
      router.replace("/");
    }
  }
};


  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("role");
    router.replace("/");
  };
  const fetchCars = async () => {
  try {
    const t = await SecureStore.getItemAsync("token");
    if (!t) {
      router.replace("/");
      return;
    }

    const res = await api.post(
      "/auth/my-cars",
      {},
      {
        headers: {
          Authorization: `Bearer ${t}`,
        },
      }
    );

    setCars(res.data.cars);
  } catch (error: any) {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync("token");
      router.replace("/");
    }
  }
};
  useFocusEffect(
    useCallback(() => {
      if (isReady) {
        fetchUser();
        fetchCars();
      }
    }, [isReady])
  );

  if (!isReady) {
    return (
      <Text style={{ marginTop: 200, textAlign: "center" }}>Loading...</Text>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges= {["top"]}>
      <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.welcome}>Hello,</Text>
          <Text style={styles.userName}>{user?.name}</Text>
        </View>

        {/* Logout button */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.section}>Your Cars</Text>

      {cars.length === 0 ? (
        <>
          <Text style={styles.noCars}>You haven't added any cars yet.</Text>

          <TouchableOpacity
            onPress={() => router.push("/add-car")}
            style={styles.addCarButton}
          >
            <Text style={styles.addCarButtonText}>+ Add a Car</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          {cars.map((car) => (
            <View key={car.car_id} style={styles.card}>
              <Text style={styles.carTitle}>
                {car.make} {car.model}
              </Text>
              <Text style={styles.carDetail}>Color: {car.color}</Text>
              <Text style={styles.carDetail}>
                Reg No: {car.registration_number}
              </Text>
              <Text style={styles.carDetail}>Area: {car.area}</Text>
              <Text style={styles.carDetail}>Pincode: {car.pincode}</Text>

              {car.car_photo ? (
                <Image
                  source={{ uri: `data:image/jpeg;base64,${car.car_photo}` }}
                  style={styles.carPhoto}
                />
              ) : null}
              <View style={styles.actionRowCentered}>
                <TouchableOpacity
                  style={styles.viewSubBtnFull}
                  onPress={() =>
                    router.push({
                      pathname: "/view-subscription",
                      params: { carId: car.car_id },
                    })
                  }
                >
                  <Text style={styles.viewSubText}>View Subscription</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <TouchableOpacity
            onPress={() => router.push("/choose-service")}
            style={[styles.addCarButton, { backgroundColor: '#28a745', marginBottom: 12 }]}
          >
            <Text style={styles.addCarButtonText}>Choose Service for All Cars</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/add-car")}
            style={styles.addCarButton}
          >
            <Text style={styles.addCarButtonText}>+ Add Another Car</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: "lightgrey",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
  },

  actionRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: 12,
},

  actionRowCentered: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },

chooseServiceBtn: {
  flex: 1,
  backgroundColor: "#28a745",
  paddingVertical: 10,
  borderRadius: 8,
  marginRight: 8,
},

chooseServiceText: {
  color: "white",
  textAlign: "center",
  fontWeight: "600",
  fontSize: 15,
},

viewSubBtn: {
  flex: 1,
  backgroundColor: "#007bff",
  paddingVertical: 10,
  borderRadius: 8,
  marginLeft: 8,
},

 viewSubBtnFull: {
   backgroundColor: "#007bff",
   paddingVertical: 12,
   paddingHorizontal: 20,
   borderRadius: 8,
   alignSelf: 'center',
   width: '70%',
 },

viewSubText: {
  color: "white",
  textAlign: "center",
  fontWeight: "600",
  fontSize: 15,
},

  avatar: {
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
    avatarText: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
  },

  welcome: {
    fontSize: 16,
    color: "#666",
  },

  userName: {
    fontSize: 22,
    fontWeight: "bold",
  },

  section: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },

  noCars: {
    color: "#555",
    marginVertical: 20,
    fontSize: 16,
  },

  addCarButton: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 10,
  },

  addCarButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },

  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    elevation: 3,
    marginBottom: 15,
  },

  carTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },

  carDetail: {
    fontSize: 15,
    marginBottom: 2,
    color: "#444",
  },

  carPhoto: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginTop: 10,
  },
  logoutBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#ff4d4d",
    borderRadius: 8,
    alignSelf: "flex-end",
  },

  logoutText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
});